import os

import requests
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .permissions import IsCustomer
from .serializers import CustomerProfileSerializer, CustomerRegistrationSerializer, UnifiedLoginSerializer


User = get_user_model()


def build_auth_payload(user, dashboard_path):
    refresh = RefreshToken.for_user(user)
    refresh["role"] = user.role
    refresh["dashboard_path"] = dashboard_path
    access = refresh.access_token
    access["role"] = user.role
    access["dashboard_path"] = dashboard_path
    return {
        "refresh": str(refresh),
        "access": str(access),
        "role": user.role,
        "dashboard_path": dashboard_path,
    }


class CustomerRegisterView(generics.CreateAPIView):
    serializer_class = CustomerRegistrationSerializer
    permission_classes = [AllowAny]


class UnifiedLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UnifiedLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data["identifier"].strip()
        password = serializer.validated_data["password"]

        user = User.objects.filter(role="customer").filter(username=identifier).first()
        if user is None and "@" in identifier:
            user = User.objects.filter(role="customer", email__iexact=identifier).first()

        if user and user.check_password(password):
            return Response(
                {
                    **build_auth_payload(user, "/customer"),
                    "user": CustomerProfileSerializer(user).data,
                }
            )

        staff_service_url = os.getenv("STAFF_SERVICE_URL", "http://staff-service:8000")
        try:
            response = requests.post(
                f"{staff_service_url}/api/auth/login/",
                json={"identifier": identifier, "password": password},
                timeout=int(os.getenv("SERVICE_TIMEOUT", "10")),
            )
            payload = response.json()
        except requests.RequestException:
            return Response({"detail": "Authentication service unavailable."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        if response.status_code != status.HTTP_200_OK:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        payload["dashboard_path"] = "/staff"
        return Response(payload)


class CustomerProfileView(generics.RetrieveAPIView):
    serializer_class = CustomerProfileSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_object(self):
        return self.request.user
