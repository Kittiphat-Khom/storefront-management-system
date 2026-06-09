from decimal import Decimal, InvalidOperation

from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.products.models import Product
from apps.products.permissions import IsProductOwner, IsSeller
from apps.products.serializers import MarketplaceProductSerializer, ProductSerializer


def parse_price_filter(value, field_name):
    if value in [None, ""]:
        return None
    try:
        price = Decimal(value)
    except (InvalidOperation, TypeError):
        raise ValidationError({field_name: "Must be a valid number."})
    if price < 0:
        raise ValidationError({field_name: "Must be greater than or equal to zero."})
    return price


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsSeller, IsProductOwner]

    def get_queryset(self):
        queryset = Product.objects.select_related("seller").filter(
            seller=self.request.user,
            is_active=True,
        )

        q = self.request.query_params.get("search")
        if q:
            queryset = queryset.filter(
                Q(title__icontains=q) | Q(description__icontains=q),
            )

        ordering = self.request.query_params.get("ordering")
        if ordering in ["unit_price", "-unit_price", "created_at", "-created_at"]:
            queryset = queryset.order_by(ordering)

        return queryset

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user, is_active=True)

    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        product.is_active = False
        product.save(update_fields=["is_active", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class MarketplaceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MarketplaceProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Product.objects.select_related("seller").filter(
            is_active=True,
            available_quantity__gt=0,
        )
        q = self.request.query_params.get("search")
        if q:
            queryset = queryset.filter(
                Q(title__icontains=q) | Q(description__icontains=q),
            )

        min_price = parse_price_filter(
            self.request.query_params.get("min_price"),
            "min_price",
        )
        if min_price is not None:
            queryset = queryset.filter(unit_price__gte=min_price)

        max_price = parse_price_filter(
            self.request.query_params.get("max_price"),
            "max_price",
        )
        if max_price is not None:
            queryset = queryset.filter(unit_price__lte=max_price)

        ordering = self.request.query_params.get("ordering")
        if ordering in ["unit_price", "-unit_price", "created_at", "-created_at"]:
            queryset = queryset.order_by(ordering)

        return queryset
