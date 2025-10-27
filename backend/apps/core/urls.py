from rest_framework.routers import DefaultRouter
from .views import (
    AthleteViewSet,
    SportTypeViewSet,
    TrainingSessionViewSet,
    ExercisesViewSet,
    AthleteLevelViewSet,
    AthleteParamsViewSet,
    MuscleViewSet
)

router = DefaultRouter()
router.register(r'athletes', AthleteViewSet)
router.register(r'athlete-levels', AthleteLevelViewSet)
router.register(r'athlete-params', AthleteParamsViewSet)
router.register(r'sport-types', SportTypeViewSet)
router.register(r'training-sessions', TrainingSessionViewSet)
router.register(r'exercises', ExercisesViewSet)
router.register(r'muscles', MuscleViewSet)

urlpatterns = router.urls
