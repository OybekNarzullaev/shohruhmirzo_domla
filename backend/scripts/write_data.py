import pandas as pd
import django
from django.db import transaction
import os
import sys

# Loyihangiz asosiy katalogini sys.path ga qo‘shing
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings")
django.setup()


@transaction.atomic
def run():
    from apps.core.models import TrainingSession, Exercise, Muscle, MuscleFatigue
    df = pd.read_excel('data.xlsx')
    rows = df.iloc[1:]
    for index, row in rows.iterrows():
        training_id = int(row['day']) + 33
        training = TrainingSession.objects.get(id=training_id)
        exercise = Exercise.objects.filter(
            description=row['exercise'], training_id=training_id
        ).first()
        if not exercise:
            exercise = Exercise(
                training=training,
                signal_length=int(row['signal_len_ms']),
                description=row['exercise'],
                first_count=row['signal_start_ms'],
                last_count=row['signal_end_ms'],
                hrate=row['hr_bpm'],

            )
            exercise.save()
        muscle = Muscle.objects.get(shortname=row['muscle_code'])
        fatigue = MuscleFatigue(
            exercise=exercise,
            muscle=muscle,
            fatigue=row['fatigue']
        )
        fatigue.save()
        print(training.id)


if __name__ == "__main__":
    try:
        run()
        print("Bajarildi.")
    except Exception as e:
        print(f"Xatolik yuz berdi: {e}")
