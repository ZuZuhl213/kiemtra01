from django.urls import path

from .views import StaffLoginView, StaffProductDetailView, StaffProductListView, StaffProfileView


urlpatterns = [
    path("auth/login/", StaffLoginView.as_view(), name="staff-login"),
    path("auth/me/", StaffProfileView.as_view(), name="staff-profile"),
    path("products/", StaffProductListView.as_view(), name="staff-products"),
    path("products/<str:category>/<int:product_id>/", StaffProductDetailView.as_view(), name="staff-product-detail"),
]
