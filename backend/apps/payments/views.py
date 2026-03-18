import stripe
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order
from .models import Payment


class CreatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        provider = request.data.get("provider", "stripe")

        try:
            order = Order.objects.get(id=order_id, user=request.user, status="pending")
        except Order.DoesNotExist:
            return Response(
                {"error": "Sipariş bulunamadı."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if provider == "stripe":
            return self._create_stripe_payment(order)
        elif provider == "iyzico":
            return self._create_iyzico_payment(order, request)
        else:
            return Response(
                {"error": "Geçersiz ödeme sağlayıcısı."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def _create_stripe_payment(self, order):
        stripe.api_key = settings.STRIPE_SECRET_KEY

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": order.currency.lower(),
                            "product_data": {"name": f"Sipariş #{order.order_number}"},
                            "unit_amount": int(order.total * 100),
                        },
                        "quantity": 1,
                    }
                ],
                mode="payment",
                success_url=f"{settings.CORS_ALLOWED_ORIGINS[0]}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.CORS_ALLOWED_ORIGINS[0]}/checkout/cancel",
                metadata={"order_id": str(order.id)},
            )

            Payment.objects.create(
                order=order,
                provider="stripe",
                status="processing",
                amount=order.total,
                currency=order.currency,
                provider_session_id=session.id,
            )

            return Response({"checkout_url": session.url, "session_id": session.id})

        except stripe.error.StripeError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def _create_iyzico_payment(self, order, request):
        payment = Payment.objects.create(
            order=order,
            provider="iyzico",
            status="processing",
            amount=order.total,
            currency=order.currency,
        )

        return Response({
            "payment_id": str(payment.id),
            "message": "Iyzico ödeme entegrasyonu hazırlanıyor.",
        })


class StripeWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            order_id = session["metadata"]["order_id"]

            try:
                payment = Payment.objects.get(
                    provider_session_id=session["id"], provider="stripe"
                )
                payment.status = "completed"
                payment.provider_payment_id = session.get("payment_intent", "")
                payment.save()

                payment.order.status = "confirmed"
                payment.order.save(update_fields=["status"])
            except Payment.DoesNotExist:
                pass

        return Response(status=status.HTTP_200_OK)


class PaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, user=request.user)
            payment = order.payments.last()
            if payment:
                return Response({
                    "status": payment.status,
                    "provider": payment.provider,
                    "amount": str(payment.amount),
                    "currency": payment.currency,
                })
            return Response(
                {"error": "Ödeme bulunamadı."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Order.DoesNotExist:
            return Response(
                {"error": "Sipariş bulunamadı."},
                status=status.HTTP_404_NOT_FOUND,
            )
