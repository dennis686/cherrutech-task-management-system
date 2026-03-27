from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .auth import login, logout, register, send_otp, verify_otp
from .views import TaskViewSet, support_ticket


router = DefaultRouter()
router.register(r"tasks", TaskViewSet, basename="task")


urlpatterns = [
    path("", include(router.urls)),
    path("auth/register/", register, name="register"),
    path("auth/login/", login, name="login"),
    path("auth/logout/", logout, name="logout"),
    path("auth/send-otp/", send_otp, name="send_otp"),
    path("auth/verify-otp/", verify_otp, name="verify_otp"),
    path("support/", support_ticket, name="support_ticket"),
]
