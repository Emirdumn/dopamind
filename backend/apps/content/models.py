from django.db import models
from django.utils.text import slugify

from apps.core.models import TimeStampedModel


class ContentCategory(TimeStampedModel):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)

    class Meta:
        verbose_name = "İçerik Kategorisi"
        verbose_name_plural = "İçerik Kategorileri"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Article(TimeStampedModel):
    class ArticleStatus(models.TextChoices):
        DRAFT = "draft", "Taslak"
        PUBLISHED = "published", "Yayında"
        ARCHIVED = "archived", "Arşivlenmiş"

    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True)
    excerpt = models.CharField(max_length=500, blank=True)
    body = models.TextField()
    cover_image = models.ImageField(upload_to="articles/", blank=True, null=True)

    author = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, related_name="articles"
    )
    category = models.ForeignKey(
        ContentCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="articles"
    )
    status = models.CharField(
        max_length=10, choices=ArticleStatus.choices, default=ArticleStatus.DRAFT
    )

    # SEO
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.CharField(max_length=500, blank=True)

    is_featured = models.BooleanField(default=False)
    view_count = models.PositiveIntegerField(default=0)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Makale"
        verbose_name_plural = "Makaleler"
        ordering = ["-published_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class Video(TimeStampedModel):
    class VideoPlatform(models.TextChoices):
        YOUTUBE = "youtube", "YouTube"
        VIMEO = "vimeo", "Vimeo"
        TIKTOK = "tiktok", "TikTok"
        INSTAGRAM = "instagram", "Instagram"
        OTHER = "other", "Diğer"

    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True)
    description = models.TextField(blank=True)
    thumbnail = models.ImageField(upload_to="videos/thumbnails/", blank=True, null=True)

    platform = models.CharField(max_length=10, choices=VideoPlatform.choices)
    video_url = models.URLField()
    embed_code = models.TextField(blank=True)

    category = models.ForeignKey(
        ContentCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="videos"
    )
    is_featured = models.BooleanField(default=False)
    view_count = models.PositiveIntegerField(default=0)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Video"
        verbose_name_plural = "Videolar"
        ordering = ["-published_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class SocialMediaLink(TimeStampedModel):
    class Platform(models.TextChoices):
        INSTAGRAM = "instagram", "Instagram"
        TIKTOK = "tiktok", "TikTok"
        YOUTUBE = "youtube", "YouTube"
        TWITTER = "twitter", "Twitter/X"
        FACEBOOK = "facebook", "Facebook"

    platform = models.CharField(max_length=15, choices=Platform.choices, unique=True)
    url = models.URLField()
    username = models.CharField(max_length=100)
    follower_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Sosyal Medya Bağlantısı"
        verbose_name_plural = "Sosyal Medya Bağlantıları"

    def __str__(self):
        return f"{self.platform} - @{self.username}"
