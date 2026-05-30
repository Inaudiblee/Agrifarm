# Agrifarm API Reference

## Seeded Test Data

After running `npm run db:seed`, the database contains all 30 Pasig barangays, two sample seller stores, two active products, and one buyer.

- Buyer login: `buyer@agrifarm.local`
- Seller logins: `rosario.farm@agrifarm.local`, `pinagbuhatan.growers@agrifarm.local`
- Admin login: `admin@agrifarm.local`
- Password for seeded users: `password123`

## Useful API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/health`
- `GET /api/barangays`
- `GET /api/categories`
- `GET /api/stores`
- `GET /api/stores/slug/:slug`
- `POST /api/users/me/addresses`
- `PATCH /api/users/me/addresses/:id`
- `DELETE /api/users/me/addresses/:id`
- `POST /api/sellers/profile`
- `POST /api/stores`
- `PATCH /api/stores/:id`
- `POST /api/stores/:id/service-areas`
- `GET /api/products?barangay=Kapitolyo`
- `GET /api/products/:id`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:id`
- `DELETE /api/cart/items/:id`
- `POST /api/orders/checkout`
- `POST /api/orders/:id/cancel`
- `GET /api/orders/seller`
- `PATCH /api/orders/seller/:id/status`
- `POST /api/payments/webhook`
- `GET /api/admin/users`
- `GET /api/admin/stores`
- `GET /api/admin/orders`
- `GET /api/admin/audit-logs`
