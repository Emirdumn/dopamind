from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Address

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email", "first_name", "last_name", "phone",
            "password", "password_confirm",
            "preferred_language", "preferred_currency",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Şifreler eşleşmiyor."})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "full_name",
            "phone", "preferred_language", "preferred_currency",
            "created_at",
        ]
        read_only_fields = ["id", "email", "created_at"]


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "id", "address_type", "title", "first_name", "last_name",
            "phone", "address_line1", "address_line2",
            "city", "state", "postal_code", "country", "is_default",
        ]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
