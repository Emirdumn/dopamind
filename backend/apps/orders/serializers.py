from rest_framework import serializers

from .models import Cart, CartItem, Order, OrderItem


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_slug = serializers.CharField(source="product.slug", read_only=True)
    product_image = serializers.SerializerMethodField()
    price_try = serializers.DecimalField(
        source="product.price_try", max_digits=10, decimal_places=2, read_only=True
    )
    price_usd = serializers.DecimalField(
        source="product.price_usd", max_digits=10, decimal_places=2, read_only=True
    )
    line_total_try = serializers.SerializerMethodField()
    line_total_usd = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id", "product", "product_name", "product_slug", "product_image",
            "quantity", "price_try", "price_usd", "line_total_try", "line_total_usd",
        ]

    def get_product_image(self, obj):
        img = obj.product.images.filter(is_primary=True).first()
        if not img:
            img = obj.product.images.first()
        if img:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(img.image.url)
        return None

    def get_line_total_try(self, obj):
        return str(obj.product.price_try * obj.quantity)

    def get_line_total_usd(self, obj):
        return str(obj.product.price_usd * obj.quantity)


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    total_try = serializers.SerializerMethodField()
    total_usd = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "items", "total_items", "total_try", "total_usd"]

    def get_total_try(self, obj):
        return str(obj.get_total("TRY"))

    def get_total_usd(self, obj):
        return str(obj.get_total("USD"))


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, default=1)


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0)


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id", "product_name", "product_sku", "quantity",
            "unit_price", "total_price",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "order_number", "status", "currency",
            "subtotal", "shipping_cost", "tax", "total",
            "shipping_first_name", "shipping_last_name",
            "shipping_city", "shipping_country",
            "tracking_number", "items",
            "created_at", "updated_at",
        ]


class OrderListSerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id", "order_number", "status", "currency",
            "total", "item_count", "created_at",
        ]

    def get_item_count(self, obj):
        return obj.items.count()


class CheckoutSerializer(serializers.Serializer):
    shipping_address_id = serializers.UUIDField()
    billing_address_id = serializers.UUIDField()
    currency = serializers.ChoiceField(choices=["TRY", "USD"], default="TRY")
    notes = serializers.CharField(required=False, allow_blank=True, default="")
