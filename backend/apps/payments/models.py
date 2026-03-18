from django.db import models

from apps.core.models import TimeStampedModel


class Payment(TimeStampedModel):
    class PaymentProvider(models.TextChoices):
        STRIPE = "stripe", "Stripe"
        IYZICO = "iyzico", "Iyzico"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Beklemede"
        PROCESSING = "processing", "İşleniyor"
        COMPLETED = "completed", "Tamamlandı"
        FAILED = "failed", "Başarısız"
        REFUNDED = "refunded", "İade Edildi"
        CANCELLED = "cancelled", "İptal Edildi"

    order = models.ForeignKey(
        "orders.Order", on_delete=models.CASCADE, related_name="payments"
    )
    provider = models.CharField(max_length=10, choices=PaymentProvider.choices)
    status = models.CharField(
        max_length=15, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="TRY")

    # Provider-specific IDs
    provider_payment_id = models.CharField(max_length=255, blank=True)
    provider_session_id = models.CharField(max_length=255, blank=True)

    metadata = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)

    class Meta:
        verbose_name = "Ödeme"
        verbose_name_plural = "Ödemeler"

    def __str__(self):
        return f"{self.provider} - {self.order.order_number} - {self.status}"
