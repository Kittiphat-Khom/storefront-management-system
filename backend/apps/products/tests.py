from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.products.models import Product


User = get_user_model()


def product_image(name="product.gif"):
    return SimpleUploadedFile(
        name,
        b"GIF87a\x01\x00\x01\x00\x80\x01\x00\x00\x00\x00ccc,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;",
        content_type="image/gif",
    )


class ProductPermissionTests(APITestCase):
    def setUp(self):
        self.seller = User.objects.create_user(
            email="seller@example.com",
            username="seller",
            password="password123",
            role=User.Role.SELLER,
        )
        self.other_seller = User.objects.create_user(
            email="other@example.com",
            username="other",
            password="password123",
            role=User.Role.SELLER,
        )
        self.buyer = User.objects.create_user(
            email="buyer@example.com",
            username="buyer",
            password="password123",
            role=User.Role.BUYER,
        )
        self.product = Product.objects.create(
            seller=self.seller,
            title="Notebook",
            description="Plain notebook",
            unit_price=Decimal("35.00"),
            available_quantity=10,
        )

    def test_seller_can_create_product(self):
        self.client.force_authenticate(self.seller)

        response = self.client.post(
            reverse("products-list"),
            {
                "image": product_image(),
                "title": "Pen",
                "description": "Black ink",
                "unit_price": "12.00",
                "available_quantity": 20,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.get(title="Pen").seller, self.seller)

    def test_seller_create_product_requires_image(self):
        self.client.force_authenticate(self.seller)

        response = self.client.post(
            reverse("products-list"),
            {
                "title": "Pen",
                "description": "Black ink",
                "unit_price": "12.00",
                "available_quantity": 20,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("image", response.data)

    def test_buyer_cannot_create_product(self):
        self.client.force_authenticate(self.buyer)

        response = self.client.post(
            reverse("products-list"),
            {
                "title": "Pen",
                "description": "Black ink",
                "unit_price": "12.00",
                "available_quantity": 20,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_buyer_cannot_access_seller_product_list(self):
        self.client.force_authenticate(self.buyer)

        response = self.client.get(reverse("products-list"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_seller_cannot_find_another_sellers_product(self):
        self.client.force_authenticate(self.other_seller)

        response = self.client.patch(
            reverse("products-detail", args=[self.product.id]),
            {"title": "Changed"},
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_seller_can_list_only_own_products(self):
        Product.objects.create(
            seller=self.other_seller,
            title="Other product",
            description="Other",
            unit_price=Decimal("99.00"),
            available_quantity=5,
        )
        self.client.force_authenticate(self.seller)

        response = self.client.get(reverse("products-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Notebook")

    def test_seller_delete_product_soft_deletes_listing(self):
        self.client.force_authenticate(self.seller)

        response = self.client.delete(reverse("products-detail", args=[self.product.id]))
        self.product.refresh_from_db()
        list_response = self.client.get(reverse("products-list"))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(self.product.is_active)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data, [])


class MarketplaceTests(APITestCase):
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
        Product.objects.create(
            seller=self.seller,
            title="Coffee Beans",
            description="Arabica beans",
            unit_price=Decimal("240.00"),
            available_quantity=10,
        )
        Product.objects.create(
            seller=self.seller,
            title="Sold Out Mug",
            description="No stock",
            unit_price=Decimal("180.00"),
            available_quantity=0,
        )

    def test_buyer_can_list_available_marketplace_products(self):
        self.client.force_authenticate(self.buyer)

        response = self.client.get(reverse("marketplace-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Coffee Beans")

    def test_marketplace_search_filter(self):
        self.client.force_authenticate(self.buyer)

        response = self.client.get(reverse("marketplace-list"), {"search": "coffee"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_seller_can_view_marketplace_products(self):
        self.client.force_authenticate(self.seller)

        response = self.client.get(reverse("marketplace-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Coffee Beans")

    def test_marketplace_hides_inactive_products(self):
        Product.objects.filter(title="Coffee Beans").update(is_active=False)
        self.client.force_authenticate(self.buyer)

        response = self.client.get(reverse("marketplace-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])


class MarketplaceFilterTests(APITestCase):
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
        self.cheap = Product.objects.create(
            seller=self.seller,
            title="Cheap Item",
            description="Budget product",
            unit_price=Decimal("50.00"),
            available_quantity=5,
        )
        self.mid = Product.objects.create(
            seller=self.seller,
            title="Mid Item",
            description="Mid-range product",
            unit_price=Decimal("200.00"),
            available_quantity=5,
        )
        self.expensive = Product.objects.create(
            seller=self.seller,
            title="Expensive Item",
            description="Premium product",
            unit_price=Decimal("500.00"),
            available_quantity=5,
        )

    def test_min_price_filter_excludes_cheaper_products(self):
        self.client.force_authenticate(self.buyer)

        response = self.client.get(reverse("marketplace-list"), {"min_price": "100"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [p["title"] for p in response.data]
        self.assertNotIn("Cheap Item", titles)
        self.assertIn("Mid Item", titles)
        self.assertIn("Expensive Item", titles)

    def test_max_price_filter_excludes_expensive_products(self):
        self.client.force_authenticate(self.buyer)

        response = self.client.get(reverse("marketplace-list"), {"max_price": "300"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [p["title"] for p in response.data]
        self.assertIn("Cheap Item", titles)
        self.assertIn("Mid Item", titles)
        self.assertNotIn("Expensive Item", titles)

    def test_invalid_price_filter_returns_validation_error(self):
        self.client.force_authenticate(self.buyer)

        response = self.client.get(reverse("marketplace-list"), {"min_price": "abc"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("min_price", response.data)

    def test_negative_price_filter_returns_validation_error(self):
        self.client.force_authenticate(self.buyer)

        response = self.client.get(reverse("marketplace-list"), {"max_price": "-1"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("max_price", response.data)

    def test_price_range_filter_returns_only_matching_products(self):
        self.client.force_authenticate(self.buyer)

        response = self.client.get(
            reverse("marketplace-list"), {"min_price": "100", "max_price": "300"}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [p["title"] for p in response.data]
        self.assertEqual(titles, ["Mid Item"])

    def test_ordering_by_price_ascending(self):
        self.client.force_authenticate(self.buyer)

        response = self.client.get(
            reverse("marketplace-list"), {"ordering": "unit_price"}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        prices = [Decimal(p["unit_price"]) for p in response.data]
        self.assertEqual(prices, sorted(prices))

    def test_ordering_by_price_descending(self):
        self.client.force_authenticate(self.buyer)

        response = self.client.get(
            reverse("marketplace-list"), {"ordering": "-unit_price"}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        prices = [Decimal(p["unit_price"]) for p in response.data]
        self.assertEqual(prices, sorted(prices, reverse=True))
