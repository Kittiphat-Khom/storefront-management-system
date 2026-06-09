from rest_framework import serializers

from apps.carts.models import CartItem
from apps.products.models import Product
from apps.products.serializers import ProductSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source="product",
        write_only=True,
    )
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_id", "quantity", "line_total"]

    def get_line_total(self, obj):
        return obj.product.unit_price * obj.quantity

    def validate(self, attrs):
        product = attrs.get("product", getattr(self.instance, "product", None))
        quantity = attrs.get("quantity", getattr(self.instance, "quantity", 1))
        if quantity <= 0:
            raise serializers.ValidationError({"quantity": "Quantity must be positive."})
        if product and quantity > product.available_quantity:
            raise serializers.ValidationError({"quantity": "Not enough stock."})
        return attrs


class CartSerializer(serializers.Serializer):
    items = CartItemSerializer(many=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
