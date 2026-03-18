from django.contrib import admin
from modeltranslation.admin import TranslationAdmin

from .models import ContentCategory, Article, Video, SocialMediaLink


@admin.register(ContentCategory)
class ContentCategoryAdmin(TranslationAdmin):
    list_display = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Article)
class ArticleAdmin(TranslationAdmin):
    list_display = ["title", "author", "category", "status", "is_featured", "view_count", "published_at"]
    list_filter = ["status", "is_featured", "category"]
    search_fields = ["title", "excerpt", "body"]
    prepopulated_fields = {"slug": ("title",)}
    list_editable = ["status", "is_featured"]

    fieldsets = (
        ("İçerik", {
            "fields": ("title", "slug", "excerpt", "body", "cover_image"),
        }),
        ("Yayın", {
            "fields": ("author", "category", "status", "is_featured", "published_at"),
        }),
        ("SEO", {
            "fields": ("meta_title", "meta_description"),
            "classes": ("collapse",),
        }),
    )


@admin.register(Video)
class VideoAdmin(TranslationAdmin):
    list_display = ["title", "platform", "category", "is_featured", "view_count", "published_at"]
    list_filter = ["platform", "is_featured", "category"]
    search_fields = ["title", "description"]
    prepopulated_fields = {"slug": ("title",)}


@admin.register(SocialMediaLink)
class SocialMediaLinkAdmin(admin.ModelAdmin):
    list_display = ["platform", "username", "follower_count", "is_active"]
    list_editable = ["is_active"]
