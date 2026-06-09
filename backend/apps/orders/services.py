from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.carts.models import CartItem
from apps.orders.models import Order, OrderItem
from apps.products.models import Product


@transaction.atomic
def checkout_cart(buyer):
    cart_items = (
        CartItem.objects.select_for_update()
        .select_related("product")
        .filter(buyer=buyer)
        .order_by("id")
    )
    if not cart_items.exists():
        raise ValidationError({"cart": "Cart is empty."})

    product_ids = [item.product_id for item in cart_items]
    products = {
        product.id: product
        for product in Product.objects.select_for_update().filter(id__in=product_ids)
    }

    for item in cart_items:
        product = products[item.product_id]
        if item.quantity > product.available_quantity:
            raise ValidationError(
                {"cart": f"Not enough stock for {product.title}."},
            )

    order = Order.objects.create(buyer=buyer)
    total_amount = 0
    order_items = []
    for item in cart_items:
        product = products[item.product_id]
        product.available_quantity -= item.quantity
        product.save(update_fields=["available_quantity", "updated_at"])
        total_amount += product.unit_price * item.quantity
        order_items.append(
            OrderItem(
                order=order,
                product=product,
                quantity=item.quantity,
                unit_price=product.unit_price,
            ),
        )

    OrderItem.objects.bulk_create(order_items)
    order.total_amount = total_amount
    order.save(update_fields=["total_amount"])
    cart_items.delete()
    return order

