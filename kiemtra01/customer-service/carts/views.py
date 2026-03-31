from requests import RequestException
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsCustomer

from .models import Cart, CartItem
from .product_client import ProductServiceClient
from .serializers import AddCartItemSerializer, CartSerializer


class ProductCatalogView(APIView):
    permission_classes = [IsAuthenticated, IsCustomer]

    def get(self, request):
        client = ProductServiceClient()
        try:
            products = client.list_products(request.query_params.get("search", "").strip())
            return Response(products)
        except RequestException:
            return Response({"detail": "Catalog service unavailable."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class ActiveCartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_object(self):
        cart, _ = Cart.objects.get_or_create(customer=self.request.user, status="active")
        return cart


class AddToCartView(APIView):
    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request):
        serializer = AddCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart, _ = Cart.objects.get_or_create(customer=request.user, status="active")
        client = ProductServiceClient()
        try:
            product = client.get_product(
                serializer.validated_data["product_source"],
                serializer.validated_data["product_id"],
            )
        except RequestException:
            return Response({"detail": "Unable to fetch product."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product_source=serializer.validated_data["product_source"],
            product_id=serializer.validated_data["product_id"],
            defaults={
                "product_name": product["name"],
                "price": product["price"],
                "quantity": serializer.validated_data["quantity"],
                "image_url": product.get("image_url", ""),
                "metadata": product,
            },
        )
        if not created:
            item.quantity += serializer.validated_data["quantity"]
            item.product_name = product["name"]
            item.price = product["price"]
            item.image_url = product.get("image_url", "")
            item.metadata = product
            item.save()
        cart.save()
        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)


class RemoveCartItemView(APIView):
    permission_classes = [IsAuthenticated, IsCustomer]

    def delete(self, request, item_id):
        cart, _ = Cart.objects.get_or_create(customer=request.user, status="active")
        deleted, _ = CartItem.objects.filter(cart=cart, id=item_id).delete()
        if not deleted:
            return Response({"detail": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND)
        cart.save()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
