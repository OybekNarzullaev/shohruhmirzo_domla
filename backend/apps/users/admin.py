from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Role


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Admin ro‘yxatda ko‘rinadigan ustunlar
    list_display = ("username", "name", "email",
                    "role", "is_active", "is_staff")
    list_filter = ("role", "is_active", "is_staff", "is_superuser")
    search_fields = ("username", "first_name",
                     "last_name", "patronymic", "email")
    ordering = ("last_name", "first_name")

    # Foydalanuvchi tahrir oynasidagi bo‘limlar
    fieldsets = (
        ("Asosiy ma'lumotlar", {
            "fields": (
                "username",
                "password",
                "first_name",
                "last_name",
                "patronymic",
                "email",
                "phone",
                "major",
                "avatar",
                "description",
            )
        }),
        ("Huquqlar va ruxsatlar", {
            "fields": (
                "role",
                "is_active",
                "is_staff",
                "is_superuser",
                "groups",
                "user_permissions",
            )
        }),
        ("Tizim ma'lumotlari", {"fields": ("last_login", "date_joined")}),
    )

    # Yangi foydalanuvchi yaratishda ko‘rinadigan maydonlar
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "username",
                "first_name",
                "last_name",
                "patronymic",
                "email",
                "phone",
                "major",
                "avatar",
                "role",
                "password1",
                "password2",
            ),
        }),
    )

    readonly_fields = ("last_login", "date_joined")

    def get_fieldsets(self, request, obj=None):
        """
        Superadmin bo‘lmaganlar uchun ba’zi bo‘limlarni yashirish.
        """
        fieldsets = super().get_fieldsets(request, obj)
        if not request.user.is_superuser:
            # Foydalanuvchining ruxsat bo‘lmagan maydonlarini olib tashlash
            filtered = []
            for title, data in fieldsets:
                if title == "Huquqlar va ruxsatlar":
                    continue
                filtered.append((title, data))
            return filtered
        return fieldsets
