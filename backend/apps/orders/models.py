from django.db import models

from apps.core.models import TimeStampedModel


class Cart(TimeStampedModel):
    user = models.OneToOneField(
        "accounts.User", on_delete=models.CASCADE, related_name="cart", null=True, blank=True
    )
    session_key = models.CharField(max_length=40, null=True, blank=True)

    class Meta:
        verbose_name = "Sepet"
        verbose_name_plural = "Sepetler"

    def __str__(self):
        if self.user:
            return f"Sepet - {self.user.email}"
        return f"Sepet - {self.session_key}"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    def get_total(self, currency="TRY"):
        total = 0
        for item in self.items.select_related("product").all():
            if currency == "TRY":
                total += item.product.price_try * item.quantity
            else:
                total += item.product.price_usd * item.quantity
        return total


class CartItem(TimeStampedModel):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        verbose_name = "Sepet Ürünü"
        verbose_name_plural = "Sepet Ürünleri"
        unique_together = ["cart", "product"]

    def __str__(self):
        return f"{self.product.name} x{self.quantity}"


class Order(TimeStampedModel):
    class OrderStatus(models.TextChoices):
        PENDING = "pending", "Beklemede"
        CONFIRMED = "confirmed", "Onaylandı"
        PROCESSING = "processing", "Hazırlanıyor"
        SHIPPED = "shipped", "Kargoya Verildi"
        DELIVERED = "delivered", "Teslim Edildi"
        CANCELLED = "cancelled", "İptal Edildi"
        REFUNDED = "refunded", "İade Edildi"

    user = models.ForeignKey("accounts.User", on_delete=models.PROTECT, related_name="orders")
    order_number = models.CharField(max_length=20, unique=True)
    status = models.CharField(
        max_length=15, choices=OrderStatus.choices, default=OrderStatus.PENDING
    )

    currency = models.CharField(max_length=3, default="TRY")
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    # Shipping address snapshot
    shipping_first_name = models.CharField(max_length=150)
    shipping_last_name = models.CharField(max_length=150)
    shipping_phone = models.CharField(max_length=20)
    shipping_address_line1 = models.CharField(max_length=255)
    shipping_address_line2 = models.CharField(max_length=255, blank=True)
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100, blank=True)
    shipping_postal_code = models.CharField(max_length=20)
    shipping_country = models.CharField(max_length=2, default="TR")

    # Billing address snapshot
    billing_first_name = models.CharField(max_length=150)
    billing_last_name = models.CharField(max_length=150)
    billing_address_line1 = models.CharField(max_length=255)
    billing_city = models.CharField(max_length=100)
    billing_postal_code = models.CharField(max_length=20)
    billing_country = models.CharField(max_length=2, default="TR")

    tracking_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Sipariş"
        verbose_name_plural = "Siparişler"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Sipariş #{self.order_number}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            import random
            import string
            self.order_number = "DPM-" + "".join(
                random.choices(string.ascii_uppercase + string.digits, k=8)
            )
        super().save(*args, **kwargs)


class OrderItem(TimeStampedModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        "products.Product", on_delete=models.SET_NULL, null=True, related_name="order_items"
    )
    product_name = models.CharField(max_length=300)
    product_sku = models.CharField(max_length=100, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = "Sipariş Kalemi"
        verbose_name_plural = "Sipariş Kalemleri"

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"

    def save(self, *args, **kwargs):
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)
