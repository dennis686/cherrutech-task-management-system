from django.contrib import admin
from django.urls import path, include
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def api_root(request):
    return Response({
        'message': 'Task Management System API',
        'version': '1.0.0',
        'endpoints': {
            'tasks': 'http://localhost:8000/api/tasks/',
            'completed': 'http://localhost:8000/api/tasks/completed/',
            'pending': 'http://localhost:8000/api/tasks/pending/',
            'high_priority': 'http://localhost:8000/api/tasks/high_priority/',
            'statistics': 'http://localhost:8000/api/tasks/statistics/',
            'register': 'http://localhost:8000/api/auth/register/',
            'login': 'http://localhost:8000/api/auth/login/',
            'logout': 'http://localhost:8000/api/auth/logout/',
            'admin': 'http://localhost:8000/admin/',
        }
    }, status=status.HTTP_200_OK)

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include('tasks.urls')),
]
