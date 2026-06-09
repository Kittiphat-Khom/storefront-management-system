from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.carts.permissions import IsBuyer
from apps.orders.models import Order
from apps.orders.serializers import OrderSerializer
from apps.orders.services import checkout_cart


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsBuyer]

    def get_queryset(self):
        return Order.objects.prefetch_related("items", "items__product").filter(
            buyer=self.request.user,
        )

    @action(detail=False, methods=["post"])
    def checkout(self, request):
        order = checkout_cart(request.user)
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

