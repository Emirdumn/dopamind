from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Address


class AddressInline(admin.StackedInline):
    model = Address
    extra = 0


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "first_name", "last_name", "is_staff", "is_active", "created_at"]
    list_filter = ["is_staff", "is_active", "preferred_language", "preferred_currency"]
    search_fields = ["email", "first_name", "last_name"]
    ordering = ["-created_at"]
    inlines = [AddressInline]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Kişisel Bilgiler", {"fields": ("first_name", "last_name", "phone")}),
        ("Tercihler", {"fields": ("preferred_language", "preferred_currency")}),
        ("İzinler", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "first_name", "password1", "password2"),
        }),
    )


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "city", "country", "address_type", "is_default"]
    list_filter = ["address_type", "country"]
    search_fields = ["title", "user__email", "city"]
