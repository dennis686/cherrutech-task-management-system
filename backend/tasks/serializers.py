from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Task, UserProfile


User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):
    assignee = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        allow_null=True,
        required=False,
    )
    assignee_name = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()

    def validate_assignee(self, value):
        if value is None:
            return value

        profile = getattr(value, "profile", None)
        if profile and profile.role == UserProfile.ROLE_ADMIN:
            raise serializers.ValidationError("Tasks cannot be assigned to admin users.")

        return value

    def get_assignee_name(self, obj):
        return obj.assignee.username if obj.assignee else None

    def get_owner_name(self, obj):
        return obj.owner.username if obj.owner else None

    class Meta:
        model = Task
        fields = [
            'id',
            'owner',
            'owner_name',
            'assignee',
            'assignee_name',
            'title',
            'description',
            'priority',
            'completed',
            'due_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
