from rest_framework import mixins, status, views, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from apps.carts.models import CartItem
from apps.carts.permissions import IsBuyer
from apps.carts.serializers import CartItemSerializer, CartSerializer


def get_cart_payload(buyer):
    items = CartItem.objects.select_related("product", "product__seller").filter(
        buyer=buyer,
    )
    total = sum(item.product.unit_price * item.quantity for item in items)
    return {"items": items, "total": total}


class CartView(views.APIView):
    permission_classes = [IsBuyer]

    def get(self, request):
        serializer = CartSerializer(get_cart_payload(request.user))
        return Response(serializer.data)


class CartItemViewSet(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = CartItemSerializer
    permission_classes = [IsBuyer]
    http_method_names = ["post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return CartItem.objects.select_related("product", "product__seller").filter(
            buyer=self.request.user,
        )

    def perform_create(self, serializer):
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]
        item, created = CartItem.objects.get_or_create(
            buyer=self.request.user,
            product=product,
            defaults={"quantity": quantity},
        )
        if not created:
            if item.quantity + quantity > product.available_quantity:
                raise ValidationError({"quantity": "Not enough stock."})
            item.quantity += quantity
            item.save(update_fields=["quantity", "updated_at"])
        serializer.instance = item

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        cart_serializer = CartSerializer(get_cart_payload(request.user))
        return Response(cart_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        response.data = CartSerializer(get_cart_payload(request.user)).data
        return response
