from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.products.models import Product


class ProductSerializer(serializers.ModelSerializer):
    seller = UserSerializer(read_only=True)
    stock_status = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "seller",
            "image",
            "title",
            "description",
            "unit_price",
            "available_quantity",
            "stock_status",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["seller", "created_at", "updated_at"]

    def get_stock_status(self, obj):
        return "in_stock" if obj.available_quantity > 0 else "out_of_stock"

    def validate(self, attrs):
        if self.instance is None and not attrs.get("image"):
            raise serializers.ValidationError({"image": "Product image is required."})
        return attrs

    def validate_available_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative.")
        return value

    def validate_unit_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Unit price must be greater than zero.")
        return value


class MarketplaceProductSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source="seller.username", read_only=True)
    stock_status = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "title",
            "description",
            "image",
            "unit_price",
            "available_quantity",
            "seller_name",
            "stock_status",
        ]

    def get_stock_status(self, obj):
        return "in_stock" if obj.available_quantity > 0 else "out_of_stock"
