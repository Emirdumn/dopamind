from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ContentCategoryViewSet,
    ArticleViewSet,
    VideoViewSet,
    SocialMediaLinkViewSet,
)

router = DefaultRouter()
router.register("categories", ContentCategoryViewSet, basename="content-category")
router.register("articles", ArticleViewSet, basename="article")
router.register("videos", VideoViewSet, basename="video")
router.register("social", SocialMediaLinkViewSet, basename="social-media")

urlpatterns = [
    path("", include(router.urls)),
]
