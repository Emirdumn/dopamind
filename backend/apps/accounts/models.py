from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from apps.core.models import TimeStampedModel
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    preferred_language = models.CharField(
        max_length=5,
        choices=[("tr", "Türkçe"), ("en", "English")],
        default="tr",
    )
    preferred_currency = models.CharField(
        max_length=3,
        choices=[("TRY", "Türk Lirası"), ("USD", "US Dollar")],
        default="TRY",
    )

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name"]

    class Meta:
        verbose_name = "Kullanıcı"
        verbose_name_plural = "Kullanıcılar"

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class Address(TimeStampedModel):
    class AddressType(models.TextChoices):
        SHIPPING = "shipping", "Teslimat"
        BILLING = "billing", "Fatura"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="addresses")
    address_type = models.CharField(max_length=10, choices=AddressType.choices, default=AddressType.SHIPPING)
    title = models.CharField(max_length=100)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=2, default="TR")
    is_default = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Adres"
        verbose_name_plural = "Adresler"

    def __str__(self):
        return f"{self.title} - {self.city}"

    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(
                user=self.user,
                address_type=self.address_type,
                is_default=True,
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)
