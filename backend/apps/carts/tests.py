from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.carts.models import CartItem
from apps.products.models import Product


User = get_user_model()


class CartItemTests(APITestCase):
    def setUp(self):
        self.seller = User.objects.create_user(
            email="seller@example.com",
            username="seller",
            password="password123",
            role=User.Role.SELLER,
        )
        self.buyer = User.objects.create_user(
            email="buyer@example.com",
            username="buyer",
            password="password123",
            role=User.Role.BUYER,
        )
        self.other_buyer = User.objects.create_user(
            email="other-buyer@example.com",
            username="otherbuyer",
            password="password123",
            role=User.Role.BUYER,
        )
        self.product = Product.objects.create(
            seller=self.seller,
            title="Mug",
            description="Ceramic mug",
            unit_price=Decimal("90.00"),
            available_quantity=3,
        )

    def test_buyer_can_add_item_to_cart(self):
        self.client.force_authenticate(self.buyer)

        response = self.client.post(
            reverse("cart-items-list"),
            {"product_id": self.product.id, "quantity": 2},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CartItem.objects.get().quantity, 2)
        self.assertEqual(response.data["total"], "180.00")

    def test_cart_item_list_get_is_not_exposed(self):
        self.client.force_authenticate(self.buyer)

        response = self.client.get(reverse("cart-items-list"))

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_seller_cannot_access_cart(self):
        self.client.force_authenticate(self.seller)

        response = self.client.get(reverse("cart"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cart_rejects_accumulated_quantity_above_stock(self):
        self.client.force_authenticate(self.buyer)
        CartItem.objects.create(buyer=self.buyer, product=self.product, quantity=2)

        response = self.client.post(
            reverse("cart-items-list"),
            {"product_id": self.product.id, "quantity": 2},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(CartItem.objects.get().quantity, 2)

    def test_buyer_can_update_cart_item_quantity(self):
        self.client.force_authenticate(self.buyer)
        item = CartItem.objects.create(buyer=self.buyer, product=self.product, quantity=1)

        response = self.client.patch(
            reverse("cart-items-detail", args=[item.id]),
            {"quantity": 3},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        self.assertEqual(item.quantity, 3)

    def test_cart_item_put_is_not_exposed(self):
        self.client.force_authenticate(self.buyer)
        item = CartItem.objects.create(buyer=self.buyer, product=self.product, quantity=1)

        response = self.client.put(
            reverse("cart-items-detail", args=[item.id]),
            {"quantity": 2},
        )

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_buyer_can_remove_cart_item(self):
        self.client.force_authenticate(self.buyer)
        item = CartItem.objects.create(buyer=self.buyer, product=self.product, quantity=1)

        response = self.client.delete(reverse("cart-items-detail", args=[item.id]))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(CartItem.objects.filter(id=item.id).exists())

    def test_buyer_cannot_access_another_buyers_cart_item(self):
        self.client.force_authenticate(self.buyer)
        item = CartItem.objects.create(
            buyer=self.other_buyer,
            product=self.product,
            quantity=1,
        )

        response = self.client.patch(
            reverse("cart-items-detail", args=[item.id]),
            {"quantity": 2},
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
