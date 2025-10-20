from rest_framework.routers import DefaultRouter
from .views import (
    AthleteViewSet,
    SportTypeViewSet,
    TrainingSessionViewSet,
    ExercisesViewSet
)

router = DefaultRouter()
router.register(r'athletes', AthleteViewSet)
router.register(r'sport-types', SportTypeViewSet)
router.register(r'training-sessions', TrainingSessionViewSet)
router.register(r'exercises', ExercisesViewSet)

urlpatterns = router.urls
