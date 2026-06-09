# ER Diagram

```mermaid
erDiagram
  users {
    bigint id PK
    string email UK
    string username
    string role "seller|buyer"
    string password
  }

  products {
    bigint id PK
    bigint seller_id FK
    string image
    string title
    text description
    decimal unit_price
    int available_quantity
    boolean is_active
    datetime created_at
    datetime updated_at
  }

  cart_items {
    bigint id PK
    bigint buyer_id FK
    bigint product_id FK
    int quantity
    datetime created_at
    datetime updated_at
  }

  orders {
    bigint id PK
    bigint buyer_id FK
    string status
    decimal total_amount
    datetime created_at
  }

  order_items {
    bigint id PK
    bigint order_id FK
    bigint product_id FK
    int quantity
    decimal unit_price
  }

  users ||--o{ products : sells
  users ||--o{ cart_items : owns
  users ||--o{ orders : places
  products ||--o{ cart_items : selected_in
  products ||--o{ order_items : purchased_as
  orders ||--|{ order_items : contains
```

## Relationship Notes

- One seller can own many products.
- One buyer can own many cart items.
- `cart_items` has a unique buyer/product pair so repeated adds update the same line.
- One buyer can place many orders.
- Each order contains one or more order items.
- `cart_items` models the current cart relationship between buyers and products.
- `order_items` models the historical many-to-many relationship between orders and products.
- Order items preserve `unit_price` at purchase time so historical totals stay stable even if product prices change later.
- Products use `is_active` for soft deletion. Inactive products remain in the database for order history but are hidden from seller inventory and marketplace listings.
