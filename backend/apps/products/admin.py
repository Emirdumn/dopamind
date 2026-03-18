from django.contrib import admin
from django.utils.html import format_html
from modeltranslation.admin import TranslationAdmin
from mptt.admin import DraggableMPTTAdmin

from .models import Category, Product, ProductImage, ProductReview


@admin.register(Category)
class CategoryAdmin(DraggableMPTTAdmin, TranslationAdmin):
    list_display = ["tree_actions", "indented_title", "slug", "is_active"]
    list_filter = ["is_active"]
    prepopulated_fields = {"slug": ("name",)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ["image", "alt_text", "is_primary", "sort_order", "image_preview"]
    readonly_fields = ["image_preview"]

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:80px;" />', obj.image.url)
        return "-"
    image_preview.short_description = "Önizleme"


class ProductReviewInline(admin.TabularInline):
    model = ProductReview
    extra = 0
    readonly_fields = ["user", "rating", "comment", "created_at"]


@admin.register(Product)
class ProductAdmin(TranslationAdmin):
    list_display = [
        "name", "product_type", "status", "price_try", "price_usd",
        "stock", "is_featured", "view_count", "created_at",
    ]
    list_filter = ["product_type", "status", "is_featured", "category"]
    search_fields = ["name", "description", "sku"]
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ["status", "is_featured", "price_try", "price_usd"]
    inlines = [ProductImageInline, ProductReviewInline]

    fieldsets = (
        ("Temel Bilgiler", {
            "fields": ("name", "slug", "description", "short_description", "category"),
        }),
        ("Ürün Tipi", {
            "fields": ("product_type", "status"),
        }),
        ("Fiyatlandırma", {
            "fields": (
                ("price_try", "compare_at_price_try"),
                ("price_usd", "compare_at_price_usd"),
            ),
        }),
        ("Stok & Kargo", {
            "fields": ("stock", "track_stock", "sku", "weight"),
        }),
        ("Affiliate", {
            "fields": ("affiliate_url", "affiliate_commission"),
            "classes": ("collapse",),
        }),
        ("Dijital Ürün", {
            "fields": ("digital_file",),
            "classes": ("collapse",),
        }),
        ("SEO", {
            "fields": ("meta_title", "meta_description"),
            "classes": ("collapse",),
        }),
        ("Diğer", {
            "fields": ("is_featured", "view_count"),
        }),
    )


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ["product", "user", "rating", "is_approved", "created_at"]
    list_filter = ["is_approved", "rating"]
    list_editable = ["is_approved"]
    search_fields = ["product__name", "user__email", "comment"]
