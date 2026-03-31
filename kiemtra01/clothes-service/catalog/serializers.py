from rest_framework import serializers

from .models import ClothesProduct


class ClothesProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClothesProduct
        fields = "__all__"
