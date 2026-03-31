from decimal import Decimal

from django.conf import settings
from django.db import models


class Cart(models.Model):
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="carts",
        on_delete=models.CASCADE,
    )
    status = models.CharField(max_length=20, default="active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart #{self.pk} - {self.customer.username}"

    @property
    def total_amount(self):
        return sum((item.line_total for item in self.items.all()), Decimal("0.00"))


class CartItem(models.Model):
    SOURCE_CHOICES = (
        ("laptop", "Laptop"),
        ("mobile", "Mobile"),
        ("clothes", "Clothes"),
    )

    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product_source = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    product_id = models.PositiveIntegerField()
    product_name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    image_url = models.URLField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("cart", "product_source", "product_id")

    @property
    def line_total(self):
        return self.price * self.quantity
