from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import random

from .models import Task, UserProfile
from .serializers import TaskSerializer
from .utils import send_otp_email  # Email utility for OTP

User = get_user_model()


def get_role_for_user(user):
    try:
        profile = user.profile
    except ObjectDoesNotExist:
        return UserProfile.ROLE_EMPLOYEE
    return profile.role


# -----------------------------
# Task Views
# -----------------------------
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_role(self):
        return get_role_for_user(self.request.user)

    def get_queryset(self):
        role = self.get_role()
        if role in {UserProfile.ROLE_ADMIN, UserProfile.ROLE_MANAGER}:
            return Task.objects.all()
        return Task.objects.filter(Q(assignee=self.request.user) | Q(owner=self.request.user)).distinct()

    def perform_create(self, serializer):
        role = self.get_role()
        if role == UserProfile.ROLE_EMPLOYEE:
            raise PermissionDenied("Employees cannot create tasks.")
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=["get"])
    def assignable_users(self, request):
        if self.get_role() == UserProfile.ROLE_EMPLOYEE:
            raise PermissionDenied("Employees cannot assign tasks.")
        users = User.objects.select_related("profile").all().order_by("username")
        payload = [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": get_role_for_user(user),
            }
            for user in users
            if get_role_for_user(user) != UserProfile.ROLE_ADMIN
        ]
        return Response(payload)

    def update(self, request, *args, **kwargs):
        role = self.get_role()
        if role == UserProfile.ROLE_EMPLOYEE:
            task = self.get_object()
            serializer = self.get_serializer(
                task,
                data={"completed": request.data.get("completed", task.completed)},
                partial=True,
            )
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if self.get_role() == UserProfile.ROLE_EMPLOYEE:
            raise PermissionDenied("Employees cannot delete tasks.")
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["get"])
    def completed(self, request):
        completed_tasks = self.get_queryset().filter(completed=True)
        serializer = self.get_serializer(completed_tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def pending(self, request):
        pending_tasks = self.get_queryset().filter(completed=False)
        serializer = self.get_serializer(pending_tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def high_priority(self, request):
        high_priority_tasks = self.get_queryset().filter(priority="high", completed=False)
        serializer = self.get_serializer(high_priority_tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        queryset = self.get_queryset()
        total = queryset.count()
        completed = queryset.filter(completed=True).count()
        pending = queryset.filter(completed=False).count()
        high_priority = queryset.filter(priority="high", completed=False).count()
        return Response(
            {
                "total": total,
                "completed": completed,
                "pending": pending,
                "high_priority": high_priority,
                "completion_percentage": (completed / total * 100) if total > 0 else 0,
            }
        )


# -----------------------------
# Support Ticket View
# -----------------------------
@api_view(["POST"])
def support_ticket(request):
    subject = (request.data.get("subject") or "").strip()
    message = (request.data.get("message") or "").strip()
    email = (request.data.get("email") or "").strip()

    if not subject or not message:
        return Response(
            {"error": "Subject and message are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "message": "Support request received.",
            "ticket": {
                "subject": subject,
                "email": email,
            },
        },
        status=status.HTTP_201_CREATED,
    )


# -----------------------------
# OTP Login Views
# -----------------------------
import random
import logging
from django.conf import settings
from django.core.mail import send_mail
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

@api_view(["POST"])
def send_otp(request):
    """
    Sends a 6-digit OTP to the user's registered email.
    """
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    otp = str(random.randint(100000, 999999))
    
    # Store OTP in session (you may want to add expiration later)
    request.session[f"otp_for_{user.id}"] = otp
    request.session.set_expiry(600)  # 10 minutes expiry (optional but recommended)

    # Send email with good error handling
    success = send_otp_email(user.email, otp)

    if success:
        return Response({"message": f"OTP sent to {email}"}, status=status.HTTP_200_OK)
    else:
        # In development, still tell user it was "sent" but show OTP in logs
        if settings.DEBUG:
            return Response({
                "message": f"OTP generated. Check backend terminal (email sending failed)."
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Failed to send OTP. Please try again later."}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def send_otp_email(to_email: str, otp: str):
    """Helper function to send OTP email with proper logging"""
    subject = "Your OTP Code - Verification"
    message = f"""Hello,

Your verification OTP is: {otp}

This code will expire in 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
Your App Team
"""

    try:
        sent = send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=False,   # Important: Raise error so we can catch it
        )

        if sent > 0:
            logger.info(f"✅ OTP sent successfully to {to_email} | OTP: {otp}")
            print(f"✅ OTP sent to {to_email} → {otp}")   # Visible in terminal
            return True
        else:
            logger.warning(f"⚠️ send_mail returned 0 for {to_email}")
            return False

    except Exception as e:
        logger.error(f"❌ Failed to send OTP to {to_email}: {str(e)}", exc_info=True)
        print(f"❌ EMAIL ERROR for {to_email}: {type(e).__name__} - {e}")
        
        # Fallback: Always show OTP in terminal during local development
        if settings.DEBUG:
            print(f"\n🔑 DEBUG OTP (email failed) → {otp} for {to_email}\n")
        
        return False