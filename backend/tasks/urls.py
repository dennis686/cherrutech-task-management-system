from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet
from .auth import register, login, logout

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/logout/', logout, name='logout'),
]
