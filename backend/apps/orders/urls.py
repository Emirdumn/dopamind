from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CartView, OrderViewSet, CheckoutView

router = DefaultRouter()
router.register("orders", OrderViewSet, basename="order")

urlpatterns = [
    path("cart/", CartView.as_view(), name="cart"),
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    path("", include(router.urls)),
]
