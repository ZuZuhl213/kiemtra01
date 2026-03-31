from django.urls import path

from .views import ActiveCartView, AddToCartView, ProductCatalogView, RemoveCartItemView


urlpatterns = [
    path("products/", ProductCatalogView.as_view(), name="catalog"),
    path("cart/", ActiveCartView.as_view(), name="active-cart"),
    path("cart/items/", AddToCartView.as_view(), name="add-to-cart"),
    path("cart/items/<int:item_id>/", RemoveCartItemView.as_view(), name="remove-cart-item"),
]
