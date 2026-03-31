from requests import RequestException
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .permissions import IsStaffRole
from .product_client import ProductAdminClient
from .serializers import ProductWriteSerializer, StaffLoginSerializer, StaffProfileSerializer


User = get_user_model()


def build_auth_payload(user):
    refresh = RefreshToken.for_user(user)
    refresh["role"] = user.role
    refresh["dashboard_path"] = "/staff"
    access = refresh.access_token
    access["role"] = user.role
    access["dashboard_path"] = "/staff"
    return {
        "refresh": str(refresh),
        "access": str(access),
        "role": user.role,
        "dashboard_path": "/staff",
    }


class StaffLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = StaffLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data["identifier"].strip()
        password = serializer.validated_data["password"]

        user = User.objects.filter(role="staff", username=identifier).first()
        if user is None and "@" in identifier:
            user = User.objects.filter(role="staff", email__iexact=identifier).first()

        if not user or not user.check_password(password):
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(
            {
                **build_auth_payload(user),
                "user": StaffProfileSerializer(user).data,
            }
        )


class StaffProfileView(APIView):
    permission_classes = [IsAuthenticated, IsStaffRole]

    def get(self, request):
        return Response(StaffProfileSerializer(request.user).data)


class StaffProductListView(APIView):
    permission_classes = [IsAuthenticated, IsStaffRole]

    def get(self, request):
        try:
            return Response(ProductAdminClient().list_all())
        except RequestException:
            return Response({"detail": "Catalog services unavailable."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    def post(self, request):
        serializer = ProductWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = dict(serializer.validated_data)
        category = payload.pop("category")
        try:
            return Response(ProductAdminClient().create(category, payload), status=status.HTTP_201_CREATED)
        except RequestException:
            return Response({"detail": "Unable to create product."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class StaffProductDetailView(APIView):
    permission_classes = [IsAuthenticated, IsStaffRole]

    def put(self, request, category, product_id):
        serializer = ProductWriteSerializer(data={**request.data, "category": category})
        serializer.is_valid(raise_exception=True)
        payload = dict(serializer.validated_data)
        payload.pop("category", None)
        try:
            return Response(ProductAdminClient().update(category, product_id, payload))
        except RequestException:
            return Response({"detail": "Unable to update product."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
