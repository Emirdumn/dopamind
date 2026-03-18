from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import Address
from apps.products.models import Product
from .models import Cart, CartItem, Order, OrderItem
from .serializers import (
    CartSerializer,
    AddToCartSerializer,
    UpdateCartItemSerializer,
    OrderSerializer,
    OrderListSerializer,
    CheckoutSerializer,
)


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def get(self, request):
        cart = self._get_cart(request.user)
        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data)

    def post(self, request):
        """Add item to cart."""
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = self._get_cart(request.user)
        product = Product.objects.get(id=serializer.validated_data["product_id"])
        quantity = serializer.validated_data["quantity"]

        if product.track_stock and product.stock < quantity:
            return Response(
                {"error": "Yeterli stok yok."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, product=product,
            defaults={"quantity": quantity},
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return Response(
            CartSerializer(cart, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        """Update cart item quantity."""
        item_id = request.data.get("item_id")
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = self._get_cart(request.user)
        quantity = serializer.validated_data["quantity"]

        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response(
                {"error": "Ürün sepette bulunamadı."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if quantity == 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save()

        return Response(CartSerializer(cart, context={"request": request}).data)

    def delete(self, request):
        """Clear cart."""
        cart = self._get_cart(request.user)
        cart.items.all().delete()
        return Response(CartSerializer(cart, context={"request": request}).data)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return OrderSerializer
        return OrderListSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")


class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        cart = Cart.objects.filter(user=user).first()
        if not cart or cart.items.count() == 0:
            return Response(
                {"error": "Sepet boş."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        currency = serializer.validated_data["currency"]

        try:
            shipping_addr = Address.objects.get(
                id=serializer.validated_data["shipping_address_id"], user=user
            )
            billing_addr = Address.objects.get(
                id=serializer.validated_data["billing_address_id"], user=user
            )
        except Address.DoesNotExist:
            return Response(
                {"error": "Adres bulunamadı."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        subtotal = cart.get_total(currency)

        order = Order.objects.create(
            user=user,
            currency=currency,
            subtotal=subtotal,
            total=subtotal,
            notes=serializer.validated_data.get("notes", ""),
            shipping_first_name=shipping_addr.first_name,
            shipping_last_name=shipping_addr.last_name,
            shipping_phone=shipping_addr.phone,
            shipping_address_line1=shipping_addr.address_line1,
            shipping_address_line2=shipping_addr.address_line2,
            shipping_city=shipping_addr.city,
            shipping_state=shipping_addr.state,
            shipping_postal_code=shipping_addr.postal_code,
            shipping_country=shipping_addr.country,
            billing_first_name=billing_addr.first_name,
            billing_last_name=billing_addr.last_name,
            billing_address_line1=billing_addr.address_line1,
            billing_city=billing_addr.city,
            billing_postal_code=billing_addr.postal_code,
            billing_country=billing_addr.country,
        )

        for cart_item in cart.items.select_related("product").all():
            product = cart_item.product
            unit_price = product.price_try if currency == "TRY" else product.price_usd
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                product_sku=product.sku or "",
                quantity=cart_item.quantity,
                unit_price=unit_price,
                total_price=unit_price * cart_item.quantity,
            )

            if product.track_stock:
                product.stock -= cart_item.quantity
                product.save(update_fields=["stock"])

        cart.items.all().delete()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )
