from django.contrib import admin
from .models import (
    Athlete,
    AthleteParams,
    AthleteLevel,
    SportType,
    Muscle,
    TrainingSession,
    Exercise,
    MuscleFatigue
)

admin.site.site_header = "🏋️‍♂️ Sport monitoring tizimi"
admin.site.site_title = "Sport Admin panel"
admin.site.index_title = "Boshqaruv paneli"


class MuscleFatigueInline(admin.TabularInline):
    model = MuscleFatigue
    extra = 1
    fields = ("exercise", "muscle", "fatigue")


class AthleteParamsInline(admin.TabularInline):
    model = AthleteParams
    extra = 1
    fields = ("weight", "height", "bmi", "description", "created_at")
    readonly_fields = ("created_at",)


# --- Asosiy admin modellar ---
@admin.register(Athlete)
class AthleteAdmin(admin.ModelAdmin):
    list_display = ("fullname", "birth_year", "level", "created_at")
    search_fields = ("firstname", "lastname", "level", "patronymic")
    list_filter = ("birth_year",)
    inlines = [AthleteParamsInline]
    readonly_fields = ("created_at", "updated_at")
    ordering = ("lastname", "firstname")


@admin.register(AthleteParams)
class AthleteParamsAdmin(admin.ModelAdmin):
    list_display = ("athlete", "weight", "height", "bmi", "created_at")
    search_fields = ("athlete__firstname", "athlete__lastname")
    list_filter = ("created_at",)
    readonly_fields = ("created_at",)
    autocomplete_fields = ("athlete",)


@admin.register(AthleteLevel)
class AthleteLevelAdmin(admin.ModelAdmin):
    list_display = ("name", "number")
    search_fields = ("name",)
    ordering = ("number",)


@admin.register(SportType)
class SportTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "number")
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(Muscle)
class MuscleAdmin(admin.ModelAdmin):
    list_display = ("shortname", "name", "title")
    search_fields = ("name", "title", "shortname")


@admin.register(TrainingSession)
class TrainingSessionAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "athlete",
        "sport_type",
        "exercise_count",
        "duration",
        "created_at",
    )
    search_fields = ("title", "athlete__firstname", "athlete__lastname")
    list_filter = ("sport_type", "created_at")
    autocomplete_fields = ("athlete", "sport_type")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = (
        "training",
        "first_count",
        "last_count",
        "hrate",
        "signal_length",
    )
    search_fields = (
        "training__title", "training__athlete__firstname", "training__athlete__lastname")
    list_filter = ("training__sport_type",)
    autocomplete_fields = ("training",)
    readonly_fields = ("created_at", "updated_at")
    ordering = ("training", "first_count")
    inlines = [MuscleFatigueInline]


@admin.register(MuscleFatigue)
class MuscleFatigueAdmin(admin.ModelAdmin):
    list_display = (
        "exercise",
        "muscle",
        "fatigue",
    )
    search_fields = (
        "muscle__title",
        "muscle__name",
        "muscle__shortname",
        "exercise__training__athlete__fullname",
        "exercise__training__title",
    )
    list_filter = ("muscle__shortname",)
    autocomplete_fields = ("muscle", "exercise")
