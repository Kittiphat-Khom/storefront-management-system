# StoreFront Management System

StoreFront Management System is a seller/buyer web application. Sellers manage product listings with image uploads and stock quantities, while buyers browse the marketplace, add products to a cart, and place mock orders through a REST API that deducts inventory atomically.

## Tech Stack

- Backend: Python, Django, Django REST Framework, SimpleJWT
- Frontend: React with TypeScript, Next.js, MUI, SWR
- Database: SQLite for local development
- Testing: Django TestCase and DRF APIClient
- CI: GitHub Actions for backend tests and frontend build

## Architecture Overview

The project is a monorepo with separate `backend` and `frontend` folders. The frontend never reads the database directly; it communicates with Django through REST endpoints. Authentication uses JWT bearer tokens. Role-based permissions keep seller-only product management separate from buyer-only cart, checkout, and order history.

Backend responsibilities are split by domain:

- `accounts`: registration, login, current user, and role data
- `products`: seller product management and buyer marketplace browsing
- `carts`: buyer cart state and cart item validation
- `orders`: checkout, atomic inventory deduction, and order history

The frontend keeps API access centralized in `src/helpers/api.ts`, auth state in `src/hooks/use-auth.tsx`, and data fetching hooks in `src/swr`. MUI was chosen to match the style of the reference projects and keep forms, tables, cards, and navigation consistent.

Marketplace browsing is available to authenticated users so sellers can preview the storefront, but cart, checkout, and order history remain buyer-only.

Product deletion uses a soft-delete strategy. `DELETE /api/products/{id}/` marks the product as inactive with `is_active=False` instead of removing the database row. This keeps order history stable while hiding deleted products from seller inventory and marketplace listings.

## Project Structure

```txt
backend/
  apps/
    accounts/
    products/
    carts/
    orders/
  config/
frontend/
  src/
    app/
    components/
    config/
    decorators/
    helpers/
    hooks/
    swr/
docs/
  er-diagram.md
```

## ER Diagram

See [docs/er-diagram.md](docs/er-diagram.md).

## Prerequisites

- Python 3.14 or compatible Python 3.x
- Node.js 24 or compatible current Node.js
- npm

## Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver 8000
```

Seed demo accounts and sample products:

```bash
python manage.py seed
```

This creates `seller@example.com` and `buyer@example.com` (password: `password123`) plus 6 sample products. Safe to run multiple times.

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Environment Variables

Backend:

```env
DJANGO_SECRET_KEY=change-me
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
SQLITE_PATH=db.sqlite3
```

Frontend:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Running Tests

```bash
cd backend
source .venv/bin/activate
python manage.py test
```

Additional verification:

```bash
cd backend
python manage.py check
python manage.py makemigrations --check --dry-run

cd ../frontend
npm run lint
npm run build
```

## API Endpoints

Authentication:

- `POST /api/auth/register/` - register a seller or buyer
- `POST /api/auth/login/` - receive JWT access and refresh tokens
- `POST /api/auth/token/refresh/` - refresh access token

Seller products:

- `GET /api/products/` - list authenticated seller products
- `POST /api/products/` - create product with multipart image upload
- `GET /api/products/{id}/` - get seller product detail
- `PUT /api/products/{id}/` - full update
- `PATCH /api/products/{id}/` - partial update
- `DELETE /api/products/{id}/` - soft delete product by marking it inactive

Marketplace:

- `GET /api/marketplace/` - list active, in-stock products from all sellers
- `GET /api/marketplace/{id}/` - product detail with description, price, and stock status

Marketplace supports filters:

- `search`
- `min_price`
- `max_price`
- `ordering=unit_price|-unit_price|created_at|-created_at`

Buyer cart:

- `GET /api/cart/` - view current cart
- `POST /api/cart/items/` - add product to cart
- `PATCH /api/cart/items/{id}/` - update cart item quantity
- `DELETE /api/cart/items/{id}/` - remove cart item

Buyer orders:

- `POST /api/orders/checkout/` - checkout cart and deduct inventory atomically
- `GET /api/orders/` - list buyer orders
- `GET /api/orders/{id}/` - order detail

## Git Branches

- `main` — stable
- `develop` — integration
- `feature/auth`, `feature/products`, `feature/marketplace`, `feature/cart`, `feature/orders`, `feature/frontend`, `feature/docs`
