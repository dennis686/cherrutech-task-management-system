from django.contrib import admin
from django.urls import path, include
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def api_root(request):
    return Response({
        'message': 'TaskFlow API',
        'version': '1.0.0',
        'endpoints': {
            'tasks': '/api/tasks/',
            'task_statistics': '/api/tasks/statistics/',
            'send_registration_otp': '/api/auth/send-otp/',
            'verify_registration_otp': '/api/auth/verify-otp/',
            'login': '/api/auth/login/',
            'logout': '/api/auth/logout/',
            'support': '/api/support/',
            'admin': '/admin/',
        }
    }, status=status.HTTP_200_OK)

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include('tasks.urls')),
]
