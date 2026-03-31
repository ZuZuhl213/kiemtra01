from rest_framework import serializers

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = (
            "id",
            "product_source",
            "product_id",
            "product_name",
            "price",
            "quantity",
            "image_url",
            "metadata",
            "line_total",
        )


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ("id", "status", "created_at", "updated_at", "total_amount", "items")


class AddCartItemSerializer(serializers.Serializer):
    product_source = serializers.ChoiceField(choices=("laptop", "mobile", "clothes"))
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1, default=1)
