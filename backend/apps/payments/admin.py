from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["order", "provider", "status", "amount", "currency", "created_at"]
    list_filter = ["provider", "status", "currency"]
    search_fields = ["order__order_number", "provider_payment_id"]
    readonly_fields = [
        "order", "provider", "amount", "currency",
        "provider_payment_id", "provider_session_id",
        "metadata", "error_message", "created_at",
    ]
