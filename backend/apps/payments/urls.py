from django.urls import path

from .views import CreatePaymentView, StripeWebhookView, PaymentStatusView

urlpatterns = [
    path("create/", CreatePaymentView.as_view(), name="create-payment"),
    path("stripe/webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
    path("status/<uuid:order_id>/", PaymentStatusView.as_view(), name="payment-status"),
]
