from rest_framework import serializers
from .models import Athlete, AthleteParams, SportType, AthleteLevel, TrainingSession, Exercise, MuscleFatigue, Muscle


class SportTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SportType
        fields = "__all__"


class AthleteParamsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AthleteParams
        fields = "__all__"

    def create(self, validated_data):
        weight = validated_data['weight']
        height = validated_data['height']
        height_m = height / 100  # metrga o‘tkazamiz

        # BMI hisoblash: vazn / (bo‘y^2)
        bmi = round(weight / (height_m ** 2), 2)
        validated_data['bmi'] = bmi
        return super().create(validated_data)


class AthleteLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = AthleteLevel
        fields = "__all__"


class AthleteSerializer(serializers.ModelSerializer):
    name = serializers.ReadOnlyField()
    params = serializers.SerializerMethodField(read_only=True)
    level_id = serializers.PrimaryKeyRelatedField(
        queryset=AthleteLevel.objects.all(),
        source="level",

    )
    level = AthleteLevelSerializer(read_only=True)

    class Meta:
        model = Athlete
        fields = "__all__"

    def get_params(self, obj):
        params = obj.params.last()
        return AthleteParamsSerializer(params).data

    def to_internal_value(self, data):
        """
        `picture` maydoni string (URL) bo'lsa → uni olib tashlaydi
        Faqat File yoki null bo'lsa saqlaydi
        """
        # Agar picture string (URL) bo'lsa → e'tiborsiz qoldiramiz
        picture = data.get("picture")
        if isinstance(picture, str):
            data = data.copy()  # mutable qilish uchun
            data.pop("picture", None)

        return super().to_internal_value(data)


class TrainingSessionSerializer(serializers.ModelSerializer):
    athlete_fullname = serializers.ReadOnlyField(source="athlete.fullname")
    sport_type_name = serializers.ReadOnlyField(source="sport_type.name")

    class Meta:
        model = TrainingSession
        fields = "__all__"
        extra_kwargs = {
            "athlete": {"required": True},
            "title": {"required": True},
            "sport_type": {"required": True},
            "file_EMT": {"required": True},
        }


class MuscleSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = Muscle


class MuscleFatigueSerializer(serializers.ModelSerializer):
    muscle = MuscleSerializer()

    class Meta:
        fields = '__all__'
        model = MuscleFatigue


class ExerciseSerializer(serializers.ModelSerializer):
    muscles = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Exercise
        fields = [
            'id',
            "first_count",
            "last_count",
            'hrate',
            "description",
            "signal_length",
            "created_at",
            "training",
            "muscles",
        ]
        extra_kwargs = {
            "first_count": {"required": True},
            "last_count": {"required": True},
            "training": {"required": True},
        }

    def get_muscles(self, obj):
        muscles = MuscleFatigue.objects.filter(exercise=obj)
        return MuscleFatigueSerializer(muscles, many=True).data

    def validate(self, attrs):
        first_count = attrs.get("first_count")
        last_count = attrs.get("last_count")
        training = attrs.get("training")
        print(last_count, first_count)
        # 1️⃣ first_count > 0 bo‘lishi kerak
        if first_count is not None and first_count <= 0:
            raise serializers.ValidationError({
                "first_count": "Qiymat 0 dan katta bo‘lishi kerak."
            })

        # 2️⃣ last_count <= training.last_count bo‘lishi kerak
        if training and last_count is not None:
            if last_count > training.duration:
                raise serializers.ValidationError({
                    "last_count": f"Qiymat {training.duration} dan oshmasligi kerak."
                })

        # 3️⃣ (ixtiyoriy) first_count <= last_count sharti ham foydali bo‘lishi mumkin
        if first_count is not None and last_count is not None:
            if first_count > last_count:
                raise serializers.ValidationError({
                    "last_count": "Oxirgi hisob birinchisidan kichik bo‘lmasligi kerak."
                })

        return attrs
