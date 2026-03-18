from django.db import models
from django.utils.text import slugify
from mptt.models import MPTTModel, TreeForeignKey

from apps.core.models import TimeStampedModel


class Category(MPTTModel, TimeStampedModel):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="categories/", blank=True, null=True)
    parent = TreeForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="children"
    )
    is_active = models.BooleanField(default=True)

    class MPTTMeta:
        order_insertion_by = ["name"]

    class Meta:
        verbose_name = "Kategori"
        verbose_name_plural = "Kategoriler"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(TimeStampedModel):
    class ProductType(models.TextChoices):
        PHYSICAL = "physical", "Fiziksel Ürün"
        DIGITAL = "digital", "Dijital Ürün"
        AFFILIATE = "affiliate", "Affiliate Ürün"

    class ProductStatus(models.TextChoices):
        DRAFT = "draft", "Taslak"
        ACTIVE = "active", "Aktif"
        ARCHIVED = "archived", "Arşivlenmiş"

    name = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True)

    product_type = models.CharField(
        max_length=10, choices=ProductType.choices, default=ProductType.PHYSICAL
    )
    status = models.CharField(
        max_length=10, choices=ProductStatus.choices, default=ProductStatus.DRAFT
    )

    category = TreeForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="products"
    )

    price_try = models.DecimalField(max_digits=10, decimal_places=2, help_text="TRY fiyat")
    price_usd = models.DecimalField(max_digits=10, decimal_places=2, help_text="USD fiyat")
    compare_at_price_try = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Karşılaştırma fiyatı (TRY) - indirim göstermek için"
    )
    compare_at_price_usd = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Karşılaştırma fiyatı (USD)"
    )

    stock = models.PositiveIntegerField(default=0)
    track_stock = models.BooleanField(default=True)
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    # Affiliate fields
    affiliate_url = models.URLField(blank=True)
    affiliate_commission = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )

    # Digital product fields
    digital_file = models.FileField(upload_to="digital_products/", blank=True, null=True)

    # SEO
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.CharField(max_length=500, blank=True)

    is_featured = models.BooleanField(default=False)
    view_count = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Ürün"
        verbose_name_plural = "Ürünler"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def is_in_stock(self):
        if not self.track_stock:
            return True
        return self.stock > 0

    @property
    def discount_percentage_try(self):
        if self.compare_at_price_try and self.compare_at_price_try > self.price_try:
            return int(
                ((self.compare_at_price_try - self.price_try) / self.compare_at_price_try) * 100
            )
        return 0


class ProductImage(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/")
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Ürün Görseli"
        verbose_name_plural = "Ürün Görselleri"
        ordering = ["sort_order"]

    def __str__(self):
        return f"{self.product.name} - Image {self.sort_order}"


class ProductReview(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    is_approved = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Ürün Yorumu"
        verbose_name_plural = "Ürün Yorumları"
        unique_together = ["product", "user"]

    def __str__(self):
        return f"{self.user.email} - {self.product.name} ({self.rating}/5)"
