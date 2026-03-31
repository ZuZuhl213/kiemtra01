from rest_framework import filters, viewsets

from .models import ClothesProduct
from .serializers import ClothesProductSerializer


class ClothesProductViewSet(viewsets.ModelViewSet):
    queryset = ClothesProduct.objects.all()
    serializer_class = ClothesProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "brand", "description"]
