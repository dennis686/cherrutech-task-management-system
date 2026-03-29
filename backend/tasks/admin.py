from django.contrib import admin
from .models import OTPVerification, Task, UserProfile

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'assignee', 'priority', 'completed', 'created_at']
    list_filter = ['priority', 'completed', 'created_at']
    search_fields = ['title', 'description', 'owner__username', 'assignee__username']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Task Information', {
            'fields': ('title', 'description')
        }),
        ('Assignment', {
            'fields': ('owner', 'assignee')
        }),
        ('Status', {
            'fields': ('completed', 'priority')
        }),
        ('Dates', {
            'fields': ('due_date', 'created_at', 'updated_at')
        }),
    )


@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ["email", "phone", "user", "otp_code", "created_at", "verified_at"]
    search_fields = ["email", "phone", "user__username"]
    readonly_fields = ["created_at", "verified_at"]


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "role", "created_at"]
    search_fields = ["user__username", "user__email"]
    list_filter = ["role", "created_at"]
    readonly_fields = ["created_at"]
