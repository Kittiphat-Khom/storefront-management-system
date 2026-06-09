from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.exceptions import ValidationError

from apps.carts.models import CartItem
from apps.orders.services import checkout_cart
from apps.products.models import Product


User = get_user_model()


class CheckoutCartTests(APITestCase):
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
            title="Coffee beans",
            description="Fresh roasted beans",
            unit_price=Decimal("120.00"),
            available_quantity=5,
        )

    def test_checkout_creates_order_decrements_inventory_and_clears_cart(self):
        CartItem.objects.create(buyer=self.buyer, product=self.product, quantity=2)

        order = checkout_cart(self.buyer)
        self.product.refresh_from_db()

        self.assertEqual(order.items.count(), 1)
        self.assertEqual(order.total_amount, Decimal("240.00"))
        self.assertEqual(self.product.available_quantity, 3)
        self.assertFalse(CartItem.objects.filter(buyer=self.buyer).exists())

    def test_checkout_endpoint_decrements_inventory_and_clears_cart(self):
        self.client.force_authenticate(self.buyer)
        CartItem.objects.create(buyer=self.buyer, product=self.product, quantity=2)

        response = self.client.post(reverse("orders-checkout"))
        self.product.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.product.available_quantity, 3)
        self.assertFalse(CartItem.objects.filter(buyer=self.buyer).exists())

    def test_checkout_snapshots_unit_price_on_order_item(self):
        CartItem.objects.create(buyer=self.buyer, product=self.product, quantity=1)

        order = checkout_cart(self.buyer)
        self.product.unit_price = Decimal("999.00")
        self.product.save(update_fields=["unit_price"])

        item = order.items.get()
        self.assertEqual(item.unit_price, Decimal("120.00"))
        self.assertEqual(item.line_total, Decimal("120.00"))

    def test_checkout_rejects_quantity_above_stock(self):
        CartItem.objects.create(buyer=self.buyer, product=self.product, quantity=6)

        with self.assertRaises(ValidationError):
            checkout_cart(self.buyer)

        self.product.refresh_from_db()
        self.assertEqual(self.product.available_quantity, 5)

    def test_checkout_endpoint_rejects_empty_cart(self):
        self.client.force_authenticate(self.buyer)

        response = self.client.post(reverse("orders-checkout"))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_buyer_can_list_own_orders(self):
        CartItem.objects.create(buyer=self.buyer, product=self.product, quantity=1)
        checkout_cart(self.buyer)
        self.client.force_authenticate(self.buyer)

        response = self.client.get(reverse("orders-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
