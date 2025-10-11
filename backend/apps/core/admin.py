from django.contrib import admin
from .models import Athlete, SportType, TrainingSession


@admin.register(Athlete)
class AthleteAdmin(admin.ModelAdmin):
    list_display = ("fullname", "birth_year", "weight", "height", "created_at")
    search_fields = ("firstname", "lastname", "patronymic")
    list_filter = ("birth_year",)
    readonly_fields = ("created_at", "updated_at", "fullname")
    fieldsets = (
        ("Shaxsiy ma'lumotlar", {
            "fields": ("firstname", "lastname", "patronymic", "birth_year")
        }),
        ("Jismoniy ko‘rsatkichlar", {
            "fields": ("weight", "height")
        }),
        ("Rasm", {
            "fields": ("picture",)
        }),
        ("Tizim ma'lumotlari", {
            "fields": ("created_at", "updated_at", "fullname")
        }),
    )


@admin.register(SportType)
class SportTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name",)
    ordering = ("name",)


class TrainingSessionInline(admin.TabularInline):
    model = TrainingSession
    extra = 1
    fields = (
        "sport_type",
        "pre_heart_rate",
        "post_heart_rate",
        "exercise_count",
        "duration",
        "file",
        "created_at",
    )
    readonly_fields = ("created_at",)
    show_change_link = True


@admin.register(TrainingSession)
class TrainingSessionAdmin(admin.ModelAdmin):
    list_display = (
        "athlete",
        "sport_type",
        "pre_heart_rate",
        "post_heart_rate",
        "exercise_count",
        "duration",
        "created_at",
    )
    list_filter = ("sport_type", "created_at")
    search_fields = (
        "athlete__firstname",
        "athlete__lastname",
        "sport_type__name",
    )
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("athlete", "sport_type")
    ordering = ("-created_at",)


# optional — agar sportchini ochganingizda uning mashg‘ulotlarini ichida ko‘rmoqchi bo‘lsangiz:
AthleteAdmin.inlines = [TrainingSessionInline]
