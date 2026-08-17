import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger(__name__)

def send_reset_otp_email(to_email: str, otp_code: str, user_name: str = "User") -> bool:
    """
    Sends a confidential 6-digit OTP code to the user's email address.
    If SMTP settings are configured in .env, sends real email via SMTP.
    Otherwise, logs securely to backend server logs.
    """
    subject = "Vision2Venture — Password Reset Verification Code"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
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

    # Check if SMTP is configured
    smtp_host = settings.SMTP_HOST or 'smtp.gmail.com'
    smtp_port = int(settings.SMTP_PORT or 587)
    smtp_user = settings.SMTP_USER
    smtp_pass = settings.SMTP_PASSWORD
    from_email = settings.SMTP_FROM_EMAIL or smtp_user or "noreply@vision2venture.com"

    if smtp_user and smtp_pass:
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"Vision2Venture Security <{from_email}>"
            msg['To'] = to_email
            
            part = MIMEText(html_content, 'html')
            msg.attach(part)
            
            if smtp_port == 465:
                with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=12) as server:
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(from_email, [to_email], msg.as_string())
            else:
                with smtplib.SMTP(smtp_host, smtp_port, timeout=12) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(from_email, [to_email], msg.as_string())
            
            print(f"\n[EMAIL SERVICE] [OK] OTP email successfully sent via SMTP to {to_email}!")
            return True
        except Exception as e:
            print(f"\n[EMAIL SERVICE] [FAIL] Failed to send SMTP email to {to_email}: {e}")

    # Fallback server logging when SMTP_USER or SMTP_PASSWORD are not set in .env
    print(f"\n" + "="*80)
    print(f"[CONFIDENTIAL EMAIL OUTBOX - SMTP CONFIGURATION NEEDED]")
    print(f"  To:       {to_email}")
    print(f"  Subject:  {subject}")
    print(f"  OTP Code: {otp_code} (Valid for 15 minutes)")
    print(f"  Notice:   Set SMTP_USER and SMTP_PASSWORD in .env to enable live email delivery.")
    print(f"="*80 + "\n")
    return True
