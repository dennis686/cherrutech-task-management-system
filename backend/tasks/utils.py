# tasks/utils.py
from django.core.mail import send_mail
from django.conf import settings

def send_otp_email(email: str, otp: str):
    """
    Sends a one-time password (OTP) to the user's email using SMTP.
    """
    subject = "Your Login OTP"
    message = f"Your OTP code is: {otp}"
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,  # raise error if email fails
    )