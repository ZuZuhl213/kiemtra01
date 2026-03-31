from django.urls import path

from .views import CustomerProfileView, CustomerRegisterView, UnifiedLoginView


urlpatterns = [
    path("register/", CustomerRegisterView.as_view(), name="customer-register"),
    path("login/", UnifiedLoginView.as_view(), name="unified-login"),
    path("me/", CustomerProfileView.as_view(), name="customer-profile"),
]
