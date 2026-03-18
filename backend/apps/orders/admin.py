from django.contrib import admin

from .models import Cart, CartItem, Order, OrderItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ["product", "quantity"]


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ["user", "total_items", "created_at"]
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product", "product_name", "product_sku", "quantity", "unit_price", "total_price"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "order_number", "user", "status", "currency",
        "total", "created_at",
    ]
    list_filter = ["status", "currency", "created_at"]
    search_fields = ["order_number", "user__email", "shipping_city"]
    list_editable = ["status"]
    readonly_fields = [
        "order_number", "user", "subtotal", "shipping_cost", "tax", "total",
        "created_at", "updated_at",
    ]
    inlines = [OrderItemInline]

    fieldsets = (
        ("Sipariş Bilgileri", {
            "fields": ("order_number", "user", "status", "currency"),
        }),
        ("Tutar", {
            "fields": ("subtotal", "shipping_cost", "tax", "total"),
        }),
        ("Teslimat Adresi", {
            "fields": (
                "shipping_first_name", "shipping_last_name", "shipping_phone",
                "shipping_address_line1", "shipping_address_line2",
                "shipping_city", "shipping_state", "shipping_postal_code", "shipping_country",
            ),
        }),
        ("Kargo", {
            "fields": ("tracking_number",),
        }),
        ("Notlar", {
            "fields": ("notes",),
        }),
    )
