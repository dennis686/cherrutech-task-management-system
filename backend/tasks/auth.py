from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

@api_view(['POST'])
def register(request):
    """
    Register a new user
    POST /api/auth/register/
    {
        "username": "username",
        "email": "email@example.com",
        "password": "password",
        "password_confirm": "password"
    }
    """
    data = request.data
    
    # Validation
    if not data.get('username') or not data.get('email') or not data.get('password'):
        return Response(
            {'error': 'Username, email, and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if data.get('password') != data.get('password_confirm'):
        return Response(
            {'error': 'Passwords do not match'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user already exists
    if User.objects.filter(username=data.get('username')).exists():
        return Response(
            {'error': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(email=data.get('email')).exists():
        return Response(
            {'error': 'Email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user
    try:
        user = User.objects.create_user(
            username=data.get('username'),
            email=data.get('email'),
            password=data.get('password')
        )
        
        # Create token for the user
        token, created = Token.objects.get_or_create(user=user)
        
        return Response(
            {
                'message': 'User registered successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                },
                'token': token.key
            },
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
def login(request):
    """
    Login user and return token
    POST /api/auth/login/
    {
        "username": "username",
        "password": "password"
    }
    """
    data = request.data
    
    username = data.get('username') or data.get('email')
    password = data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username/email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Try to authenticate
    user = authenticate(request, username=username, password=password)
    
    if user is None:
        # Try with email if username fails
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None
    
    if user is None:
        return Response(
            {'error': 'Invalid username or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Get or create token
    token, created = Token.objects.get_or_create(user=user)
    
    return Response(
        {
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            },
            'token': token.key
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
def logout(request):
    """
    Logout user by deleting token
    POST /api/auth/logout/
    """
    try:
        if request.user and request.user.is_authenticated:
            request.user.auth_token.delete()
            return Response(
                {'message': 'Logout successful'},
                status=status.HTTP_200_OK
            )
    except:
        pass
    
    return Response(
        {'error': 'User not authenticated'},
        status=status.HTTP_401_UNAUTHORIZED
    )
