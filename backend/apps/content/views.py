from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend

from .models import ContentCategory, Article, Video, SocialMediaLink
from .serializers import (
    ContentCategorySerializer,
    ArticleListSerializer,
    ArticleDetailSerializer,
    VideoSerializer,
    SocialMediaLinkSerializer,
)


class ContentCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ContentCategory.objects.all()
    serializer_class = ContentCategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"


class ArticleViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = "slug"
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category__slug", "is_featured"]
    search_fields = ["title", "excerpt", "body"]
    ordering_fields = ["published_at", "view_count"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ArticleDetailSerializer
        return ArticleListSerializer

    def get_queryset(self):
        return Article.objects.filter(status="published").select_related("author", "category")

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Article.objects.filter(pk=instance.pk).update(view_count=instance.view_count + 1)
        serializer = self.get_serializer(instance)
        from rest_framework.response import Response
        return Response(serializer.data)


class VideoViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = "slug"
    permission_classes = [permissions.AllowAny]
    serializer_class = VideoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["platform", "category__slug", "is_featured"]
    search_fields = ["title", "description"]

    def get_queryset(self):
        return Video.objects.filter(published_at__isnull=False).select_related("category")


class SocialMediaLinkViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SocialMediaLink.objects.filter(is_active=True)
    serializer_class = SocialMediaLinkSerializer
    permission_classes = [permissions.AllowAny]
