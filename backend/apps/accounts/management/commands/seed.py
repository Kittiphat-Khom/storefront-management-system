from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.products.models import Product

User = get_user_model()

SELLER_EMAIL = "seller@example.com"
BUYER_EMAIL = "buyer@example.com"
PASSWORD = "password123"

PRODUCTS = [
    {
        "title": "Mechanical Keyboard TKL",
        "description": "Tenkeyless mechanical keyboard with Cherry MX Brown switches. Compact layout, ideal for programming and everyday typing.",
        "unit_price": "2490.00",
        "available_quantity": 15,
    },
    {
        "title": "Wireless Mouse Pro",
        "description": "Ergonomic wireless mouse with 2.4GHz receiver, 3200 DPI adjustable, 60-hour battery life.",
        "unit_price": "890.00",
        "available_quantity": 30,
    },
    {
        "title": "USB-C Hub 7-in-1",
        "description": "7-port USB-C hub: 4K HDMI, 2x USB-A 3.0, USB-C PD 100W, SD/MicroSD card reader.",
        "unit_price": "1290.00",
        "available_quantity": 20,
    },
    {
        "title": "27-inch Monitor Stand",
        "description": "Adjustable aluminum monitor stand with cable management. Supports monitors up to 27 inches and 10 kg.",
        "unit_price": "1590.00",
        "available_quantity": 8,
    },
    {
        "title": "Laptop Sleeve 15-inch",
        "description": "Water-resistant neoprene laptop sleeve with accessory pocket. Fits laptops up to 15.6 inches.",
        "unit_price": "390.00",
        "available_quantity": 50,
    },
    {
        "title": "Webcam 1080p",
        "description": "Full HD 1080p webcam with built-in microphone and auto light correction. Plug-and-play USB.",
        "unit_price": "1190.00",
        "available_quantity": 2,
    },
]


class Command(BaseCommand):
    help = "Seed demo accounts and sample products"

    def handle(self, *args, **options):
        seller = self._create_user(SELLER_EMAIL, "seller_demo", "seller")
        self._create_user(BUYER_EMAIL, "buyer_demo", "buyer")
        self._create_products(seller)
        self.stdout.write(self.style.SUCCESS("\nDemo data ready."))
        self.stdout.write(f"  Seller : {SELLER_EMAIL} / {PASSWORD}")
        self.stdout.write(f"  Buyer  : {BUYER_EMAIL} / {PASSWORD}")

    def _create_user(self, email, username, role):
        user, created = User.objects.get_or_create(
            email=email,
            defaults={"username": username, "role": role},
        )
        if created:
            user.set_password(PASSWORD)
            user.save()
            self.stdout.write(f"  Created {role}: {email}")
        else:
            self.stdout.write(f"  Exists  {role}: {email}")
        return user

    def _create_products(self, seller):
        for data in PRODUCTS:
            product, created = Product.objects.get_or_create(
                seller=seller,
                title=data["title"],
                defaults={
                    "description": data["description"],
                    "unit_price": data["unit_price"],
                    "available_quantity": data["available_quantity"],
                },
            )
            status = "Created" if created else "Exists "
            self.stdout.write(f"  {status} product: {product.title}")
