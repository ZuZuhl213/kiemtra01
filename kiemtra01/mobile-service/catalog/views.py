from rest_framework import filters, viewsets

from .models import MobileProduct
from .serializers import MobileProductSerializer


class MobileProductViewSet(viewsets.ModelViewSet):
    queryset = MobileProduct.objects.all()
    serializer_class = MobileProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "brand", "description"]
