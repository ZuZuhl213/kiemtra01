from rest_framework import serializers

from .models import MobileProduct


class MobileProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = MobileProduct
        fields = "__all__"
