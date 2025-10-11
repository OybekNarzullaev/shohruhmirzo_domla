from rest_framework import serializers
from .models import Athlete, SportType, TrainingSession


class SportTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SportType
        fields = "__all__"


class AthleteSerializer(serializers.ModelSerializer):
    fullname = serializers.ReadOnlyField()

    class Meta:
        model = Athlete
        fields = "__all__"


class TrainingSessionSerializer(serializers.ModelSerializer):
    athlete_fullname = serializers.ReadOnlyField(source="athlete.fullname")
    sport_type_name = serializers.ReadOnlyField(source="sport_type.name")

    class Meta:
        model = TrainingSession
        fields = "__all__"
