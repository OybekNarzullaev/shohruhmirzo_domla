from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.conf import settings
from .models import User


class UserAdmin(BaseUserAdmin):
    """Custom admin for User model."""

    list_display = (
        'username', 'email', 'fullname', 'role', 'phone', 'is_staff', 'is_active',
        'avatar_thumbnail'
    )
    list_filter = ('role', 'is_staff', 'is_active', 'groups')
    search_fields = ('username', 'first_name', 'last_name',
                     'patronymic', 'email', 'phone')
    ordering = ('username',)
    readonly_fields = ('fullname',)

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {
            'fields': ('first_name', 'last_name', 'patronymic', 'email', 'phone', 'avatar')
        }),
        ('Permissions', {
            'fields': (
                'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'
            )
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Additional info', {'fields': ('role',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'first_name', 'last_name', 'patronymic',
                'phone', 'avatar', 'role', 'password1', 'password2'
            ),
        }),
    )

    def fullname(self, obj):
        return obj.fullname
    fullname.short_description = "To‘liq ism"

    def avatar_thumbnail(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover;" />',
                obj.avatar.url
            )
        return "-"
    avatar_thumbnail.short_description = "Avatar"


admin.site.register(User, UserAdmin)
