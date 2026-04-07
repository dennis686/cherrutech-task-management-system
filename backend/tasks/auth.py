from datetime import timedelta
import random

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, logout as django_logout
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import OTPVerification, UserProfile


User = get_user_model()
OTP_EXPIRY_MINUTES = 10


def get_user_role(user):
    profile = getattr(user, "profile", None)
    return profile.role if profile else UserProfile.ROLE_EMPLOYEE


def validate_role(role):
    if role not in {
        UserProfile.ROLE_MANAGER,
        UserProfile.ROLE_EMPLOYEE,
    }:
        return UserProfile.ROLE_EMPLOYEE

    return role


def normalize_phone(phone):
    return (phone or "").strip()


def generate_otp_code():
    return str(random.randint(100000, 999999))


def send_sms_otp(phone, otp_code):
    sms_message = f"TaskFlow OTP for verification: {otp_code}"
    sms_backend = getattr(settings, "SMS_BACKEND", "console")

    if sms_backend == "console":
        print(f"SMS OTP to {phone}: {sms_message}")
        return

    raise NotImplementedError("SMS backend is not configured.")

def dispatch_otp(otp_code, email=None, phone=None, channel="both"):
    sent_channels = []
    failed_channels = []

    # EMAIL OTP
    if channel in {"email", "both"} and email:
        try:
            send_mail(
                "Your TaskFlow OTP",
                f"Your OTP code is {otp_code}",
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            sent_channels.append("email")
        except Exception as e:
            print(f"Failed to send email OTP to {email}: {e}")
            failed_channels.append("email")

    # SMS OTP
    if channel in {"sms", "both"} and phone:
        try:
            send_sms_otp(phone, otp_code)
            sent_channels.append("sms")
        except Exception as e:
            print(f"Failed to send SMS OTP to {phone}: {e}")
            failed_channels.append("sms")

    return {
        "sent": sent_channels,
        "failed": failed_channels
    }


def get_or_create_otp_record(email=None, phone=None, user=None):
    queryset = OTPVerification.objects.all()

    if user:
        otp_obj = queryset.filter(user=user).first()
    else:
        otp_obj = queryset.filter(user__isnull=True, email=email, phone=phone).first()

    if otp_obj:
        return otp_obj

    return OTPVerification.objects.create(
        user=user,
        email=email,
        phone=phone,
        otp_code="",
        verified_at=None,
    )


def validate_channel(channel, email=None, phone=None):
    if channel not in {"email", "sms", "both"}:
        return "Channel must be email, sms, or both."

    if channel == "email" and not email:
        return "Email is required for email OTP."

    if channel == "sms" and not phone:
        return "Phone number is required for SMS OTP."

    if channel == "both" and not email and not phone:
        return "Email or phone number is required."

    return None


def is_otp_expired(otp_obj):
    return timezone.now() > otp_obj.created_at + timedelta(minutes=OTP_EXPIRY_MINUTES)


@api_view(["POST"])
def send_otp(request):
    email = (request.data.get("email") or "").strip()
    phone = normalize_phone(request.data.get("phone"))
    channel = "email"

    if not email:
        return Response(
            {"error": "Email is required for registration OTP."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    validation_error = validate_channel(channel, email=email, phone=phone)
    if validation_error:
        return Response({"error": validation_error}, status=status.HTTP_400_BAD_REQUEST)

    otp_obj = get_or_create_otp_record(email=email or None, phone=phone or None)
    otp_obj.otp_code = generate_otp_code()
    otp_obj.created_at = timezone.now()
    otp_obj.email = email or None
    otp_obj.phone = phone or None
    otp_obj.verified_at = None
    otp_obj.save(update_fields=["otp_code", "created_at", "email", "phone", "verified_at"])

    # Use the updated dispatch_otp
    result = dispatch_otp(otp_obj.otp_code, email=email, phone=phone, channel=channel)
    sent_channels = result["sent"]
    failed_channels = result["failed"]
    channel_message = " and ".join(sent_channels) if sent_channels else "none"

    return Response(
        {
            "message": f"OTP sent via {channel_message}",
            "sent_channels": sent_channels,
            "failed_channels": failed_channels,
        }
    )

@api_view(["POST"])
def verify_otp(request):
    data = request.data
    email = (data.get("email") or "").strip()
    otp = (data.get("otp") or "").strip()
    username = (data.get("username") or "").strip()
    role = validate_role((data.get("role") or UserProfile.ROLE_EMPLOYEE).strip().lower())
    password = data.get("password")
    password_confirm = data.get("password_confirm")

    if not all([otp, username, password, password_confirm]):
        return Response(
            {
                "error": "OTP, username, password, and password_confirm are required"
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not email:
        return Response({"error": "Email is required for OTP verification"}, status=status.HTTP_400_BAD_REQUEST)

    if password != password_confirm:
        return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        otp_obj = OTPVerification.objects.get(user__isnull=True, email=email, phone__isnull=True)
    except OTPVerification.DoesNotExist:
        return Response({"error": "OTP not found"}, status=status.HTTP_400_BAD_REQUEST)

    if is_otp_expired(otp_obj):
        otp_obj.delete()
        return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

    if otp_obj.otp_code != otp:
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
    if email and User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email or "", password=password)
    UserProfile.objects.update_or_create(user=user, defaults={"role": role})
    otp_obj.user = user
    otp_obj.email = user.email
    otp_obj.verified_at = timezone.now()
    otp_obj.save(update_fields=["user", "email", "verified_at"])

    return Response(
        {
            "message": "Registration complete. Please log in.",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": role,
            },
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
def login(request):
    username = (request.data.get("username") or "").strip()
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    token, _ = Token.objects.get_or_create(user=user)
    otp_record = OTPVerification.objects.filter(user=user).first()

    if otp_record and otp_record.email != user.email:
        otp_record.email = user.email
        otp_record.save(update_fields=["email"])

    return Response(
        {
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "phone": otp_record.phone if otp_record else None,
                "role": get_user_role(user),
            },
            "token": token.key,
        }
    )


@api_view(["POST"])
def register(request):
    data = request.data
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    password_confirm = data.get("password_confirm")

    if not all([username, email, password, password_confirm]):
        return Response(
            {"error": "Username, email, password, and password_confirm are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if password != password_confirm:
        return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    token, _ = Token.objects.get_or_create(user=user)

    return Response(
        {
            "message": "User registered successfully",
            "user": {"id": user.id, "username": user.username, "email": user.email},
            "token": token.key,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
def logout(request):
    if request.auth:
        request.auth.delete()

    django_logout(request)
    return Response({"message": "Logout successful"})


@api_view(["POST"])
def request_password_reset(request):
    email = (request.data.get("email") or "").strip()

    if not email:
        return Response(
            {"error": "Email is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {"error": "No user account was found with that email address."},
            status=status.HTTP_404_NOT_FOUND,
        )

    otp_obj = get_or_create_otp_record(user=user, email=user.email or email)
    otp_obj.otp_code = generate_otp_code()
    otp_obj.created_at = timezone.now()
    otp_obj.email = user.email or email
    otp_obj.verified_at = None
    otp_obj.save(update_fields=["otp_code", "created_at", "email", "verified_at"])

    result = dispatch_otp(otp_obj.otp_code, email=otp_obj.email, channel="email")
    if "email" not in result["sent"]:
        return Response(
            {"error": "We could not send the reset OTP email. Please try again."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response({"message": "Password reset OTP sent to your email."})


@api_view(["POST"])
def reset_password(request):
    email = (request.data.get("email") or "").strip()
    otp = (request.data.get("otp") or "").strip()
    new_password = request.data.get("new_password")
    password_confirm = request.data.get("password_confirm")

    if not email or not otp or not new_password or not password_confirm:
        return Response(
            {"error": "Email, OTP, new_password, and password_confirm are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if new_password != password_confirm:
        return Response(
            {"error": "Passwords do not match."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {"error": "No user account was found with that email address."},
            status=status.HTTP_404_NOT_FOUND,
        )

    otp_obj = OTPVerification.objects.filter(user=user).first()
    if otp_obj is None or not otp_obj.otp_code:
        return Response(
            {"error": "No password reset OTP was found for this account."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if is_otp_expired(otp_obj):
        otp_obj.otp_code = ""
        otp_obj.verified_at = None
        otp_obj.save(update_fields=["otp_code", "verified_at"])
        return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

    if otp_obj.otp_code != otp:
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save(update_fields=["password"])
    Token.objects.filter(user=user).delete()
    otp_obj.otp_code = ""
    otp_obj.verified_at = timezone.now()
    otp_obj.save(update_fields=["otp_code", "verified_at"])

    return Response({"message": "Password reset successful. Please log in."})
