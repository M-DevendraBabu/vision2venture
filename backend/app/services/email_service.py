import smtplib
import ssl
import json
import urllib.request
import urllib.error
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger(__name__)

def _build_otp_html(otp_code: str, user_name: str) -> str:
    """Build the HTML email body for OTP verification."""
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 20px;">
  <div style="max-width: 500px; margin: 0 auto; background: #131b2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 30px;">
    <div style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; margin-bottom: 20px;">
      <h1 style="color: #6366f1; margin: 0; font-size: 24px;">Vision2Venture</h1>
    </div>
    <p>Hello <strong>{user_name}</strong>,</p>
    <p>You recently requested to reset your password for your Vision2Venture account. Use the confidential verification code below to complete your password reset:</p>
    <div style="background: rgba(99,102,241,0.15); border: 1px solid #6366f1; border-radius: 8px; text-align: center; padding: 15px; margin: 20px 0;">
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #818cf8; font-family: monospace;">{otp_code}</div>
    </div>
    <p style="font-size: 13px; color: #94a3b8;">This code is valid for <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email or secure your account.</p>
    <div style="font-size: 12px; color: #64748b; text-align: center; margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
      <p>&copy; 2026 Vision2Venture AI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>"""


def _build_otp_plain_text(otp_code: str, user_name: str) -> str:
    """Build plain text email body for OTP verification."""
    return f"""Hello {user_name},

You recently requested to reset your password for your Vision2Venture account.

Your verification code is: {otp_code}

This code is valid for 15 minutes. If you did not request a password reset, please ignore this email.

- Vision2Venture Team"""


def send_reset_otp_email(to_email: str, otp_code: str, user_name: str = "User") -> tuple[bool, str]:
    """
    Sends a confidential 6-digit OTP code to the user's email address.
    
    Priority order:
    1. Google Apps Script Webhook (sends through Gmail's own servers - 100% delivery)
    2. Brevo HTTPS API (Port 443)
    3. Resend HTTPS API (Port 443)
    4. SendGrid HTTPS API (Port 443)
    5. Direct SMTP (Port 465/587 - fallback for local/VPS)
    """
    subject = "Vision2Venture - Password Reset Verification Code"
    html_content = _build_otp_html(otp_code, user_name)
    plain_text = _build_otp_plain_text(otp_code, user_name)
    from_sender_email = (settings.SMTP_FROM_EMAIL.strip() if settings.SMTP_FROM_EMAIL else "") or "devendrababumotupalli@gmail.com"

    # ============================================================
    # 1. Google Apps Script Webhook (PRIMARY - 100% Gmail delivery)
    # ============================================================
    webhook_url = settings.GMAIL_WEBHOOK_URL.strip() if settings.GMAIL_WEBHOOK_URL else ""
    if webhook_url:
        try:
            req_data = json.dumps({
                "to": to_email,
                "subject": subject,
                "body": html_content,
                "userName": user_name,
                "otpCode": otp_code
            }).encode('utf-8')
            req = urllib.request.Request(
                webhook_url,
                data=req_data,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "Vision2Venture/1.0"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                resp_body = resp.read().decode('utf-8', errors='ignore')
                if resp.status in (200, 201, 302):
                    print(f"[EMAIL SERVICE] [OK] OTP sent via Google Apps Script webhook to {to_email}")
                    return (True, "")
                else:
                    print(f"[EMAIL SERVICE] Google Apps Script returned {resp.status}: {resp_body}")
        except urllib.error.HTTPError as e:
            # Google Apps Script redirects (302) on success — follow it
            if e.code in (302, 301):
                try:
                    redirect_url = e.headers.get('Location', '')
                    if redirect_url:
                        req2 = urllib.request.Request(redirect_url, headers={"User-Agent": "Vision2Venture/1.0"})
                        with urllib.request.urlopen(req2, timeout=10) as resp2:
                            resp_body = resp2.read().decode('utf-8', errors='ignore')
                            print(f"[EMAIL SERVICE] [OK] OTP sent via Google Apps Script (redirect) to {to_email}: {resp_body}")
                            return (True, "")
                except Exception as e_redir:
                    print(f"[EMAIL SERVICE] Google Apps Script redirect error: {e_redir}")
            else:
                body = e.read().decode('utf-8', errors='ignore')
                print(f"[EMAIL SERVICE] Google Apps Script HTTP {e.code}: {body}. Trying next...")
        except Exception as e_gas:
            print(f"[EMAIL SERVICE] Google Apps Script error: {e_gas}. Trying next...")

    # ============================================================
    # 2. Brevo HTTPS API (Port 443 - 300 free emails/day)
    # ============================================================
    raw_brevo = settings.BREVO_API_KEY.strip() if settings.BREVO_API_KEY else ""
    brevo_key = "".join(raw_brevo.split())
    if brevo_key.startswith("xkeysib-") and len(brevo_key) > 83:
        brevo_key = brevo_key[:83]
    if brevo_key:
        try:
            req_data = json.dumps({
                "sender": {"name": "Vision2Venture", "email": from_sender_email},
                "to": [{"email": to_email, "name": user_name}],
                "subject": subject,
                "htmlContent": html_content,
                "textContent": plain_text
            }).encode('utf-8')
            req = urllib.request.Request(
                "https://api.brevo.com/v3/smtp/email",
                data=req_data,
                headers={
                    "api-key": brevo_key,
                    "Content-Type": "application/json",
                    "User-Agent": "Vision2Venture/1.0"
                }
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                if resp.status in (200, 201):
                    print(f"[EMAIL SERVICE] [OK] OTP email dispatched via Brevo API to {to_email}")
                    return (True, "")
        except urllib.error.HTTPError as e_brevo:
            body = e_brevo.read().decode('utf-8', errors='ignore')
            print(f"[EMAIL SERVICE] Brevo API HTTP {e_brevo.code}: {body}. Trying next...")
        except Exception as e_brevo:
            print(f"[EMAIL SERVICE] Brevo API error: {e_brevo}. Trying next...")

    # ============================================================
    # 3. Resend HTTPS API (Port 443)
    # ============================================================
    resend_key = settings.RESEND_API_KEY.strip() if settings.RESEND_API_KEY else ""
    if resend_key:
        try:
            from_header = settings.RESEND_FROM_EMAIL or "Vision2Venture <onboarding@resend.dev>"
            req_data = json.dumps({
                "from": from_header,
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }).encode('utf-8')
            req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=req_data,
                headers={
                    "Authorization": f"Bearer {resend_key}",
                    "Content-Type": "application/json",
                    "User-Agent": "Vision2Venture/1.0"
                }
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                if resp.status in (200, 201):
                    print(f"[EMAIL SERVICE] [OK] OTP sent via Resend API to {to_email}")
                    return (True, "")
        except urllib.error.HTTPError as e_resend:
            body = e_resend.read().decode('utf-8', errors='ignore')
            print(f"[EMAIL SERVICE] Resend API HTTP {e_resend.code}: {body}. Trying next...")
        except Exception as e_resend:
            print(f"[EMAIL SERVICE] Resend API error: {e_resend}. Trying next...")

    # ============================================================
    # 4. SendGrid HTTPS API (Port 443)
    # ============================================================
    sendgrid_key = settings.SENDGRID_API_KEY.strip() if settings.SENDGRID_API_KEY else ""
    if sendgrid_key:
        try:
            req_data = json.dumps({
                "personalizations": [{"to": [{"email": to_email}]}],
                "from": {"email": from_sender_email, "name": "Vision2Venture"},
                "subject": subject,
                "content": [{"type": "text/html", "value": html_content}]
            }).encode('utf-8')
            req = urllib.request.Request(
                "https://api.sendgrid.com/v3/mail/send",
                data=req_data,
                headers={
                    "Authorization": f"Bearer {sendgrid_key}",
                    "Content-Type": "application/json",
                    "User-Agent": "Vision2Venture/1.0"
                }
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                if resp.status in (200, 201, 202):
                    print(f"[EMAIL SERVICE] [OK] OTP sent via SendGrid API to {to_email}")
                    return (True, "")
        except Exception as e_sendgrid:
            print(f"[EMAIL SERVICE] SendGrid error: {e_sendgrid}. Trying SMTP...")

    # ============================================================
    # 5. Direct SMTP (Port 465 SSL / Port 587 STARTTLS) - for local/VPS
    # ============================================================
    smtp_host = settings.SMTP_HOST or "smtp.gmail.com"
    smtp_user = (settings.SMTP_USER.strip() if settings.SMTP_USER else "") or "devendrababumotupalli@gmail.com"
    smtp_pass = (settings.SMTP_PASSWORD.strip() if settings.SMTP_PASSWORD else "") or "qhuvnrvgfdhuhlyn"
    from_email = (settings.SMTP_FROM_EMAIL.strip() if settings.SMTP_FROM_EMAIL else "") or smtp_user

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f"Vision2Venture <{from_email}>"
    msg['To'] = to_email
    msg.attach(MIMEText(plain_text, 'plain'))
    msg.attach(MIMEText(html_content, 'html'))
    msg_str = msg.as_string()

    # Port 465 SSL
    try:
        ctx = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_host, 465, context=ctx, timeout=6) as server:
            server.login(smtp_user, smtp_pass)
            server.sendmail(from_email, [to_email], msg_str)
        print(f"[EMAIL SERVICE] [OK] OTP sent via SSL (Port 465) to {to_email}")
        return (True, "")
    except Exception as e_ssl:
        print(f"[EMAIL SERVICE] Port 465 error: {e_ssl}. Trying Port 587...")

    # Port 587 TLS
    try:
        with smtplib.SMTP(smtp_host, 587, timeout=6) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(from_email, [to_email], msg_str)
        print(f"[EMAIL SERVICE] [OK] OTP sent via TLS (Port 587) to {to_email}")
        return (True, "")
    except Exception as e_tls:
        print(f"[EMAIL SERVICE] Port 587 error: {e_tls}")

    return (False, "All email delivery methods failed. Please configure GMAIL_WEBHOOK_URL in environment variables.")
