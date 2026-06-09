from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        SELLER = "seller", "Seller"
        BUYER = "buyer", "Buyer"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "role"]

    class Meta:
        db_table = "users"

    @property
    def is_seller(self):
        return self.role == self.Role.SELLER

    @property
    def is_buyer(self):
        return self.role == self.Role.BUYER

