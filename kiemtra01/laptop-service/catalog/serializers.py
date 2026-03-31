from rest_framework import serializers

from .models import LaptopProduct


class LaptopProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = LaptopProduct
        fields = "__all__"
