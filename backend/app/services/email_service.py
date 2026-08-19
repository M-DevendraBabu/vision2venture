import smtplib
import ssl
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger(__name__)

def send_reset_otp_email(to_email: str, otp_code: str, user_name: str = "User") -> tuple[bool, str]:
    """
    Sends a confidential 6-digit OTP code to the user's email address.
    Tries Direct SSL (Port 465) and STARTTLS (Port 587).
    Gracefully handles cloud container firewall restrictions without crashing.
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
            
            <p style="font-size: 13px; color: #94a3b8;">This code is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email or secure your account.</p>
            
            <div class="footer">
                <p>&copy; 2026 Vision2Venture AI. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    smtp_host = "smtp.gmail.com"
    smtp_user = (settings.SMTP_USER.strip() if settings.SMTP_USER else "") or "devendrababumotupalli@gmail.com"
    smtp_pass = (settings.SMTP_PASSWORD.strip() if settings.SMTP_PASSWORD else "") or "qhuvnrvgfdhuhlyn"
    from_email = (settings.SMTP_FROM_EMAIL.strip() if settings.SMTP_FROM_EMAIL else "") or smtp_user

    # Prepare MIME message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f"Vision2Venture Security <{from_email}>"
    msg['To'] = to_email
    msg.attach(MIMEText(html_content, 'html'))
    msg_str = msg.as_string()

    e_ssl_err = ""
    e_tls_err = ""

    # 1. Primary Strategy: Direct Port 465 SSL with SSLContext
    try:
        ctx = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_host, 465, context=ctx, timeout=6) as server:
            server.login(smtp_user, smtp_pass)
            server.sendmail(from_email, [to_email], msg_str)
        print(f"[EMAIL SERVICE] [OK] OTP sent successfully via SSL (Port 465) to {to_email}!")
        return (True, "")
    except Exception as e_ssl:
        e_ssl_err = str(e_ssl)
        print(f"[EMAIL SERVICE] Port 465 notice: {e_ssl_err}. Trying Port 587 STARTTLS...")

    # 2. Fallback Strategy: Port 587 STARTTLS
    try:
        with smtplib.SMTP(smtp_host, 587, timeout=6) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(from_email, [to_email], msg_str)
        print(f"[EMAIL SERVICE] [OK] OTP sent successfully via TLS (Port 587) to {to_email}!")
        return (True, "")
    except Exception as e_tls:
        e_tls_err = str(e_tls)
        print(f"[EMAIL SERVICE] Port 587 notice: {e_tls_err}")

    # Fallback log for environments where outbound SMTP is blocked
    print(f"\n[CONFIDENTIAL OTP DISPATCH] To: {to_email} | OTP Code: {otp_code} (Valid 10 mins)\n")
    return (False, f"Render Cloud SMTP restricted. Active OTP: {otp_code}")
