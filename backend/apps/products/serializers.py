from rest_framework import serializers

from .models import Category, Product, ProductImage, ProductReview


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "image", "parent", "children", "product_count"]

    def get_children(self, obj):
        children = obj.get_children().filter(is_active=True)
        return CategorySerializer(children, many=True).data

    def get_product_count(self, obj):
        return obj.products.filter(status="active").count()


class CategoryListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "image"]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text", "is_primary", "sort_order"]


class ProductReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = ProductReview
        fields = ["id", "user_name", "rating", "comment", "created_at"]
        read_only_fields = ["id", "user_name", "created_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class ProductListSerializer(serializers.ModelSerializer):
    category = CategoryListSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    discount_percentage = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "short_description", "product_type",
            "price_try", "price_usd", "compare_at_price_try", "compare_at_price_usd",
            "category", "primary_image", "is_featured", "is_in_stock",
            "discount_percentage", "avg_rating",
        ]

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first()
        if not img:
            img = obj.images.first()
        if img:
            return ProductImageSerializer(img, context=self.context).data
        return None

    def get_discount_percentage(self, obj):
        return obj.discount_percentage_try

    def get_avg_rating(self, obj):
        reviews = obj.reviews.filter(is_approved=True)
        if reviews.exists():
            return round(reviews.aggregate(avg=serializers.models.Avg("rating"))["avg"], 1)
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "description", "short_description",
            "product_type", "status",
            "price_try", "price_usd", "compare_at_price_try", "compare_at_price_usd",
            "stock", "is_in_stock", "sku", "weight",
            "affiliate_url",
            "category", "images", "reviews",
            "is_featured", "avg_rating", "review_count",
            "meta_title", "meta_description",
            "created_at",
        ]

    def get_reviews(self, obj):
        reviews = obj.reviews.filter(is_approved=True)[:10]
        return ProductReviewSerializer(reviews, many=True).data

    def get_avg_rating(self, obj):
        from django.db.models import Avg
        reviews = obj.reviews.filter(is_approved=True)
        if reviews.exists():
            return round(reviews.aggregate(avg=Avg("rating"))["avg"], 1)
        return None

    def get_review_count(self, obj):
        return obj.reviews.filter(is_approved=True).count()
