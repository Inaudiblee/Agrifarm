# Agrifarm QA and Security Notes

## API Smoke Test

Run the repeatable API smoke test after starting the backend:

```bash
npm run qa:api
```

The smoke test verifies:

- health check and database connectivity
- seeded buyer login
- refresh-token rotation
- public `ADMIN` registration blocking
- Pasig barangay/product listing
- cart oversell blocking
- multi-seller checkout split
- signed payment webhook update
- logout refresh-token revocation

## Security Defaults

- Public registration allows `BUYER` and `SELLER` only, not `ADMIN`.
- Bearer tokens expire using `JWT_EXPIRES_IN_SECONDS`.
- Refresh tokens are stored hashed, rotated on refresh, and revoked on logout.
- CORS is restricted by `WEB_ORIGIN`.
- Basic in-memory rate limiting is enabled with `RATE_LIMIT_*` env settings.
- Unknown request body fields are rejected by backend validation.
- Checkout rechecks stock in a database transaction before creating order items.
- Payment webhooks require `x-agrifarm-signature` HMAC validation.
- Key auth, seller, store, product, address, order, and payment events write to `AuditLog`.
