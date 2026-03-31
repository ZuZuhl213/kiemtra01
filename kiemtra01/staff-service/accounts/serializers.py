from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()


class StaffLoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField()


class StaffProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "full_name", "role")


class ProductWriteSerializer(serializers.Serializer):
    category = serializers.ChoiceField(choices=("laptop", "mobile", "clothes"))
    name = serializers.CharField(max_length=255)
    brand = serializers.CharField(max_length=120)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    stock = serializers.IntegerField(min_value=0)
    description = serializers.CharField()
    image_url = serializers.URLField(required=False, allow_blank=True)
    specs = serializers.JSONField(required=False)
