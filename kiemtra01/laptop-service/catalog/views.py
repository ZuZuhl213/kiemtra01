from rest_framework import filters, viewsets

from .models import LaptopProduct
from .serializers import LaptopProductSerializer


class LaptopProductViewSet(viewsets.ModelViewSet):
    queryset = LaptopProduct.objects.all()
    serializer_class = LaptopProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "brand", "description"]
