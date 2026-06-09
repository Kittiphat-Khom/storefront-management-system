from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class AuthTests(APITestCase):
    def test_register_success(self):
        response = self.client.post(
            reverse("register"),
            {
                "email": "buyer@example.com",
                "username": "buyer",
                "password": "password123",
                "role": User.Role.BUYER,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["email"], "buyer@example.com")
        self.assertNotIn("password", response.data)

    def test_login_success_returns_tokens(self):
        User.objects.create_user(
            email="buyer@example.com",
            username="buyer",
            password="password123",
            role=User.Role.BUYER,
        )

        response = self.client.post(
            reverse("token_obtain_pair"),
            {"email": "buyer@example.com", "password": "password123"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
