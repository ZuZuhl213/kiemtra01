from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from catalog.views import MobileProductViewSet

router = DefaultRouter()
router.register("products", MobileProductViewSet, basename="mobile-products")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]
