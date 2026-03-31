from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from catalog.views import LaptopProductViewSet

router = DefaultRouter()
router.register("products", LaptopProductViewSet, basename="laptop-products")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]
