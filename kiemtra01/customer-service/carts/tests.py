from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Cart


User = get_user_model()


class CartApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="cart-user",
            password="password123",
            email="cart@example.com",
            full_name="Cart User",
            role="customer",
        )
        self.client.force_authenticate(self.user)

    def test_get_active_cart_creates_empty_cart(self):
        response = self.client.get(reverse("active-cart"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_amount"], "0.00")
        self.assertEqual(response.data["items"], [])
        self.assertTrue(Cart.objects.filter(customer=self.user, status="active").exists())

    @patch("carts.views.ProductServiceClient.get_product")
    def test_add_to_cart_creates_item_and_updates_cart_timestamp(self, mock_get_product):
        mock_get_product.return_value = {
            "id": 1,
            "name": "AeroBook Pro 14",
            "price": "1299.00",
            "image_url": "https://example.com/laptop.jpg",
            "stock": 12,
        }

        cart = Cart.objects.create(customer=self.user, status="active")
        old_updated_at = cart.updated_at

        response = self.client.post(
            reverse("add-to-cart"),
            {"product_source": "laptop", "product_id": 1, "quantity": 2},
            format="json",
        )

        cart.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["total_amount"], "2598.00")
        self.assertEqual(len(response.data["items"]), 1)
        self.assertEqual(response.data["items"][0]["quantity"], 2)
        self.assertGreater(cart.updated_at, old_updated_at)

    @patch("carts.views.ProductServiceClient.get_product")
    def test_add_same_product_increments_existing_quantity(self, mock_get_product):
        mock_get_product.return_value = {
            "id": 1,
            "name": "AeroBook Pro 14",
            "price": "1299.00",
            "image_url": "https://example.com/laptop.jpg",
            "stock": 12,
        }

        self.client.post(
            reverse("add-to-cart"),
            {"product_source": "laptop", "product_id": 1, "quantity": 2},
            format="json",
        )
        response = self.client.post(
            reverse("add-to-cart"),
            {"product_source": "laptop", "product_id": 1, "quantity": 1},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data["items"]), 1)
        self.assertEqual(response.data["items"][0]["quantity"], 3)
        self.assertEqual(response.data["items"][0]["line_total"], "3897.00")

    @patch("carts.views.ProductServiceClient.get_product")
    def test_remove_cart_item_returns_empty_cart(self, mock_get_product):
        mock_get_product.return_value = {
            "id": 1,
            "name": "AeroBook Pro 14",
            "price": "1299.00",
            "image_url": "https://example.com/laptop.jpg",
            "stock": 12,
        }

        add_response = self.client.post(
            reverse("add-to-cart"),
            {"product_source": "laptop", "product_id": 1, "quantity": 1},
            format="json",
        )

        item_id = add_response.data["items"][0]["id"]
        response = self.client.delete(reverse("remove-cart-item", args=[item_id]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_amount"], "0.00")
        self.assertEqual(response.data["items"], [])

    @patch("carts.views.ProductServiceClient.get_product")
    def test_add_clothes_item_is_supported(self, mock_get_product):
        mock_get_product.return_value = {
            "id": 3,
            "name": "Urban Overshirt",
            "price": "79.00",
            "image_url": "https://example.com/clothes.jpg",
            "stock": 18,
        }

        response = self.client.post(
            reverse("add-to-cart"),
            {"product_source": "clothes", "product_id": 3, "quantity": 2},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["items"][0]["product_source"], "clothes")
        self.assertEqual(response.data["total_amount"], "158.00")

    def test_remove_missing_cart_item_returns_not_found(self):
        response = self.client.delete(reverse("remove-cart-item", args=[999999]))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "Cart item not found.")
