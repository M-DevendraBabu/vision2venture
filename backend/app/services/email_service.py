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

def send_reset_otp_email(to_email: str, otp_code: str, user_name: str = "User") -> tuple[bool, str]:
    """
    Sends a confidential 6-digit OTP code to the user's email address.
    Supports HTTPS REST APIs (Brevo, Resend, SendGrid - 100% unblocked on Render cloud)
    and direct SMTP (Port 465 / 587) fallback.
    """
    subject = "Vision2Venture — Password Reset Verification Code"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 20px; }}
            .container {{ max-width: 500px; margin: 0 auto; background: #131b2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }}
            .header {{ text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; margin-bottom: 20px; }}
            .header h1 {{ color: #6366f1; margin: 0; font-size: 24px; }}
            .otp-box {{ background: rgba(99,102,241,0.15); border: 1px solid #6366f1; border-radius: 8px; text-align: center; padding: 15px; margin: 20px 0; }}
            .otp-code {{ font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #818cf8; font-family: monospace; }}
            .footer {{ font-size: 12px; color: #64748b; text-align: center; margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Vision2Venture</h1>
            </div>
            <p>Hello <strong>{user_name}</strong>,</p>
            <p>You recently requested to reset your password for your Vision2Venture account. Use the confidential verification code below to complete your password reset:</p>
            
            <div class="otp-box">
                <div class="otp-code">{otp_code}</div>
            </div>
            
            <p style="font-size: 13px; color: #94a3b8;">This code is valid for <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email or secure your account.</p>
            
            <div class="footer">
                <p>&copy; 2026 Vision2Venture AI. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    from_sender_email = (settings.SMTP_FROM_EMAIL.strip() if settings.SMTP_FROM_EMAIL else "") or "devendrababumotupalli@gmail.com"

    # 1. Try Brevo HTTPS API (Port 443 - free 300 emails/day to ANY email address in the world)
    brevo_key = settings.BREVO_API_KEY.strip() if settings.BREVO_API_KEY else ""
    if brevo_key:
        try:
            req_data = json.dumps({
                "sender": {"name": "Vision2Venture Security", "email": from_sender_email},
                "to": [{"email": to_email, "name": user_name}],
                "subject": subject,
                "htmlContent": html_content
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
                    print(f"[EMAIL SERVICE] [OK] OTP email successfully delivered via Brevo API to {to_email}!")
                    return (True, "")
        except urllib.error.HTTPError as e_brevo:
            body = e_brevo.read().decode('utf-8', errors='ignore')
            print(f"[EMAIL SERVICE] Brevo API HTTP {e_brevo.code} notice: {body}. Trying next provider...")
        except Exception as e_brevo:
            print(f"[EMAIL SERVICE] Brevo API notice: {e_brevo}. Trying next provider...")

    # 2. Try Resend HTTPS API (Port 443)
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
                    print(f"[EMAIL SERVICE] [OK] OTP email successfully delivered via Resend API to {to_email}!")
                    return (True, "")
        except urllib.error.HTTPError as e_resend:
            body = e_resend.read().decode('utf-8', errors='ignore')
            print(f"[EMAIL SERVICE] Resend API HTTP {e_resend.code} notice: {body}. Trying next provider...")
        except Exception as e_resend:
            print(f"[EMAIL SERVICE] Resend API notice: {e_resend}. Trying next provider...")

    # 3. Try SendGrid HTTPS API (Port 443)
    sendgrid_key = settings.SENDGRID_API_KEY.strip() if settings.SENDGRID_API_KEY else ""
    if sendgrid_key:
        try:
            req_data = json.dumps({
                "personalizations": [{"to": [{"email": to_email}]}],
                "from": {"email": from_sender_email, "name": "Vision2Venture Security"},
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
                    print(f"[EMAIL SERVICE] [OK] OTP email successfully delivered via SendGrid API to {to_email}!")
                    return (True, "")
        except Exception as e_sendgrid:
            print(f"[EMAIL SERVICE] SendGrid API notice: {e_sendgrid}. Trying SMTP...")

    # 4. Try Direct SMTP (Port 465 SSL / Port 587 STARTTLS) - for local machine / VPS
    smtp_host = settings.SMTP_HOST or "smtp.gmail.com"
    smtp_user = (settings.SMTP_USER.strip() if settings.SMTP_USER else "") or "devendrababumotupalli@gmail.com"
    smtp_pass = (settings.SMTP_PASSWORD.strip() if settings.SMTP_PASSWORD else "") or "qhuvnrvgfdhuhlyn"
    from_email = (settings.SMTP_FROM_EMAIL.strip() if settings.SMTP_FROM_EMAIL else "") or smtp_user

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f"Vision2Venture Security <{from_email}>"
    msg['To'] = to_email
    msg.attach(MIMEText(html_content, 'html'))
    msg_str = msg.as_string()

    # Port 465 SSL
    try:
        ctx = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_host, 465, context=ctx, timeout=6) as server:
            server.login(smtp_user, smtp_pass)
            server.sendmail(from_email, [to_email], msg_str)
        print(f"[EMAIL SERVICE] [OK] OTP sent successfully via SSL (Port 465) to {to_email}!")
        return (True, "")
    except Exception as e_ssl:
        print(f"[EMAIL SERVICE] Port 465 notice: {e_ssl}. Trying Port 587 STARTTLS...")

    # Port 587 TLS
    try:
        with smtplib.SMTP(smtp_host, 587, timeout=6) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(from_email, [to_email], msg_str)
        print(f"[EMAIL SERVICE] [OK] OTP sent successfully via TLS (Port 587) to {to_email}!")
        return (True, "")
    except Exception as e_tls:
        print(f"[EMAIL SERVICE] Port 587 notice: {e_tls}")

    print(f"\n[CONFIDENTIAL OTP DISPATCH] To: {to_email} | OTP Code: {otp_code} (Valid 15 mins)\n")
    return (False, "All email delivery channels failed. Please configure BREVO_API_KEY or verified RESEND_API_KEY in environment variables.")
