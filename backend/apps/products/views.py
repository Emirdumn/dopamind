from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Product, ProductReview
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductReviewSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    lookup_field = "slug"
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Category.objects.filter(is_active=True, parent=None)


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = "slug"
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["product_type", "category__slug", "is_featured"]
    search_fields = ["name", "description", "short_description"]
    ordering_fields = ["price_try", "price_usd", "created_at", "view_count"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        return Product.objects.filter(status="active").select_related("category").prefetch_related("images")

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Product.objects.filter(pk=instance.pk).update(view_count=instance.view_count + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def featured(self, request):
        products = self.get_queryset().filter(is_featured=True)[:8]
        serializer = ProductListSerializer(products, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def review(self, request, slug=None):
        product = self.get_object()
        serializer = ProductReviewSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
