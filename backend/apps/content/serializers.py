from rest_framework import serializers

from .models import ContentCategory, Article, Video, SocialMediaLink


class ContentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentCategory
        fields = ["id", "name", "slug"]


class ArticleListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.full_name", read_only=True)
    category = ContentCategorySerializer(read_only=True)

    class Meta:
        model = Article
        fields = [
            "id", "title", "slug", "excerpt", "cover_image",
            "author_name", "category", "is_featured",
            "view_count", "published_at",
        ]


class ArticleDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.full_name", read_only=True)
    category = ContentCategorySerializer(read_only=True)

    class Meta:
        model = Article
        fields = [
            "id", "title", "slug", "excerpt", "body", "cover_image",
            "author_name", "category", "is_featured",
            "meta_title", "meta_description",
            "view_count", "published_at", "created_at",
        ]


class VideoSerializer(serializers.ModelSerializer):
    category = ContentCategorySerializer(read_only=True)

    class Meta:
        model = Video
        fields = [
            "id", "title", "slug", "description", "thumbnail",
            "platform", "video_url", "embed_code",
            "category", "is_featured",
            "view_count", "published_at",
        ]


class SocialMediaLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialMediaLink
        fields = ["id", "platform", "url", "username", "follower_count"]
