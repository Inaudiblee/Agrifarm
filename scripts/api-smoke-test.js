const { createHmac } = require("crypto");

const baseUrl = process.env.API_BASE_URL || "http://localhost:4000";
const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || "dev_payment_webhook_secret";

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed (${response.status}): ${text}`);
  }
  return data;
}

async function expectBlocked(label, fn) {
  try {
    await fn();
  } catch (error) {
    console.log(`PASS blocked: ${label}`);
    return;
  }
  throw new Error(`Expected blocked request: ${label}`);
}

async function main() {
  const health = await request("/api/health");
  if (health.status !== "ok") throw new Error("Health check did not return ok.");

  await expectBlocked("public ADMIN registration", () =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: `admin-${Date.now()}@example.com`,
        password: "password123",
        fullName: "Admin Attempt",
        role: "ADMIN"
      })
    })
  );

  const login = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "buyer@agrifarm.local", password: "password123" })
  });
  if (!login.token || !login.refreshToken) throw new Error("Login did not return access and refresh tokens.");
  const auth = { Authorization: `Bearer ${login.token}` };

  const refreshed = await request("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken: login.refreshToken })
  });
  if (!refreshed.token || !refreshed.refreshToken) throw new Error("Refresh did not rotate tokens.");

  const barangays = await request("/api/barangays");
  if (barangays.length !== 30) throw new Error(`Expected 30 Pasig barangays, got ${barangays.length}.`);

  const products = await request("/api/products?barangay=Kapitolyo");
  if (products.length < 2) throw new Error("Expected at least 2 Kapitolyo products.");

  await expectBlocked("cart oversell", () =>
    request("/api/cart/items", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ variantId: products[0].variants[0].id, quantity: 999999 })
    })
  );

  await request("/api/cart", { method: "DELETE", headers: auth });
  for (const product of products.slice(0, 2)) {
    await request("/api/cart/items", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ variantId: product.variants[0].id, quantity: 1 })
    });
  }

  const addresses = await request("/api/users/me/addresses", { headers: auth });
  const order = await request("/api/orders/checkout", {
    method: "POST",
    headers: auth,
    body: JSON.stringify({ shippingAddressId: addresses[0].id, paymentMethod: "CASH_ON_DELIVERY" })
  });
  if (order.sellerOrders.length !== 2) throw new Error(`Expected 2 seller orders, got ${order.sellerOrders.length}.`);

  const webhookBody = {
    orderNumber: order.orderNumber,
    status: "PAID",
    provider: "qa-smoke",
    providerRef: `qa-${Date.now()}`
  };
  const signature = createHmac("sha256", webhookSecret).update(JSON.stringify(webhookBody)).digest("hex");
  await request("/api/payments/webhook", {
    method: "POST",
    headers: { "x-agrifarm-signature": signature },
    body: JSON.stringify(webhookBody)
  });

  await request("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken: refreshed.refreshToken })
  });

  console.log("PASS api smoke test");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
