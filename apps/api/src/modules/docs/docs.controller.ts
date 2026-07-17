import { Controller, Get, Header } from "@nestjs/common";

type ApiEndpoint = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  auth: boolean;
  title: string;
  description: string;
  sampleBody?: Record<string, unknown>;
  sampleQuery?: string;
};

const endpoints: ApiEndpoint[] = [
  {
    method: "POST",
    path: "/api/auth/register",
    auth: false,
    title: "Register user",
    description: "Create a buyer account. Sellers should use the Seller Portal.",
    sampleBody: {
      email: "newbuyer@gmail.com",
      password: "password123",
      fullName: "New Buyer",
      phone: "0917 000 0000",
      role: "BUYER"
    }
  },
  {
    method: "POST",
    path: "/api/auth/login",
    auth: false,
    title: "Login",
    description: "Returns a bearer token. Paste it in the token box at the top of this page.",
    sampleBody: {
      email: "buyer@agrifarm.local",
      password: "password123"
    }
  },
  {
    method: "POST",
    path: "/api/auth/refresh",
    auth: false,
    title: "Refresh access token",
    description: "Rotates a refresh token and returns a new access token plus refresh token.",
    sampleBody: {
      refreshToken: "replace-with-refresh-token"
    }
  },
  {
    method: "POST",
    path: "/api/auth/logout",
    auth: false,
    title: "Logout",
    description: "Revokes a refresh token.",
    sampleBody: {
      refreshToken: "replace-with-refresh-token"
    }
  },
  {
    method: "GET",
    path: "/api/auth/me",
    auth: true,
    title: "Current user",
    description: "Check if your bearer token is valid."
  },
  {
    method: "GET",
    path: "/api/health",
    auth: false,
    title: "Health check",
    description: "Checks API and database availability."
  },
  {
    method: "GET",
    path: "/api/barangays",
    auth: false,
    title: "Pasig barangays",
    description: "Lists all active Pasig barangays supported by the marketplace."
  },
  {
    method: "GET",
    path: "/api/products",
    auth: false,
    title: "List products",
    description: "Browse active products. Add barangay query to filter serviceable stores.",
    sampleQuery: "?barangay=Kapitolyo"
  },
  {
    method: "GET",
    path: "/api/products/:id",
    auth: false,
    title: "Product detail",
    description: "Shows one product with variants, images, categories, and reviews."
  },
  {
    method: "GET",
    path: "/api/stores",
    auth: false,
    title: "List stores",
    description: "Browse active seller stores and service areas."
  },
  {
    method: "GET",
    path: "/api/stores/slug/:slug",
    auth: false,
    title: "Store detail",
    description: "Shows a public store profile with active products and service areas."
  },
  {
    method: "GET",
    path: "/api/categories",
    auth: false,
    title: "List categories",
    description: "Lists product categories and child categories."
  },
  {
    method: "POST",
    path: "/api/users/me/addresses",
    auth: true,
    title: "Create buyer address",
    description: "Creates a Pasig-only address tied to the current user.",
    sampleBody: {
      label: "Home",
      recipientName: "Pasig Buyer",
      phone: "0917 000 0000",
      street: "1 Market Street",
      barangay: "Kapitolyo",
      isDefault: true
    }
  },
  {
    method: "GET",
    path: "/api/users/me/addresses",
    auth: true,
    title: "My addresses",
    description: "Lists addresses owned by the current user."
  },
  {
    method: "GET",
    path: "/api/users/me/addresses/:id",
    auth: true,
    title: "Get address",
    description: "Shows one address owned by the current user."
  },
  {
    method: "PATCH",
    path: "/api/users/me/addresses/:id",
    auth: true,
    title: "Update address",
    description: "Updates one current-user address."
  },
  {
    method: "POST",
    path: "/api/users/me/addresses/:id/default",
    auth: true,
    title: "Set default address",
    description: "Marks one current-user address as default."
  },
  {
    method: "DELETE",
    path: "/api/users/me/addresses/:id",
    auth: true,
    title: "Delete address",
    description: "Soft-deletes one current-user address."
  },
  {
    method: "POST",
    path: "/api/sellers/profile",
    auth: true,
    title: "Create seller profile",
    description: "Creates or updates the current seller profile and farmer character.",
    sampleBody: {
      businessName: "Pasig Urban Farm",
      gender: "FEMALE",
      avatarKey: "female-01"
    }
  },
  {
    method: "GET",
    path: "/api/sellers/me",
    auth: true,
    title: "My seller profile",
    description: "Shows the current seller profile."
  },
  {
    method: "POST",
    path: "/api/stores",
    auth: true,
    title: "Create store",
    description: "Creates a seller store. Requires seller profile first.",
    sampleBody: {
      name: "Pasig Urban Farm",
      slug: "pasig-urban-farm",
      description: "Fresh produce for Pasig buyers.",
      status: "ACTIVE"
    }
  },
  {
    method: "GET",
    path: "/api/stores/mine",
    auth: true,
    title: "My stores",
    description: "Lists stores owned by the current seller, including service areas."
  },
  {
    method: "PATCH",
    path: "/api/stores/:id",
    auth: true,
    title: "Update store",
    description: "Updates a seller-owned store."
  },
  {
    method: "DELETE",
    path: "/api/stores/:id",
    auth: true,
    title: "Close store",
    description: "Closes a seller-owned store."
  },
  {
    method: "POST",
    path: "/api/stores/:id/service-areas",
    auth: true,
    title: "Add store service areas",
    description: "Adds Pasig barangays where a store can deliver.",
    sampleBody: {
      barangays: ["Kapitolyo", "San Antonio"],
      deliveryFee: "30.00",
      minOrder: "100.00"
    }
  },
  {
    method: "DELETE",
    path: "/api/stores/:id/service-areas/:barangayId",
    auth: true,
    title: "Remove store service area",
    description: "Disables one barangay service area for a seller-owned store."
  },
  {
    method: "POST",
    path: "/api/products",
    auth: true,
    title: "Create product",
    description: "Creates an active product and first variant for a seller-owned store.",
    sampleBody: {
      storeId: "replace-with-store-id",
      name: "Pechay",
      slug: "pechay",
      variantName: "Regular",
      sku: "PAS-PECHAY-KG",
      unit: "kg",
      price: "55.00",
      stockOnHand: 40
    }
  },
  {
    method: "PATCH",
    path: "/api/products/:id",
    auth: true,
    title: "Update product",
    description: "Updates a seller-owned product."
  },
  {
    method: "DELETE",
    path: "/api/products/:id",
    auth: true,
    title: "Archive product",
    description: "Archives a seller-owned product."
  },
  {
    method: "POST",
    path: "/api/products/:id/images",
    auth: true,
    title: "Add product image",
    description: "Adds an image to a seller-owned product."
  },
  {
    method: "POST",
    path: "/api/products/:id/variants",
    auth: true,
    title: "Add product variant",
    description: "Adds a variant/SKU to a seller-owned product."
  },
  {
    method: "PATCH",
    path: "/api/products/variants/:variantId",
    auth: true,
    title: "Update product variant",
    description: "Updates price, SKU, unit, name, or active state for a seller-owned variant."
  },
  {
    method: "POST",
    path: "/api/products/variants/:variantId/stock-adjustments",
    auth: true,
    title: "Adjust stock",
    description: "Records a stock adjustment and inventory ledger entry."
  },
  {
    method: "GET",
    path: "/api/cart",
    auth: true,
    title: "My cart",
    description: "Shows the current buyer cart."
  },
  {
    method: "POST",
    path: "/api/cart/items",
    auth: true,
    title: "Add cart item",
    description: "Adds an active product variant to the current buyer cart.",
    sampleBody: {
      variantId: "replace-with-variant-id",
      quantity: 1
    }
  },
  {
    method: "PATCH",
    path: "/api/cart/items/:id",
    auth: true,
    title: "Update cart item",
    description: "Sets quantity for one current-user cart item."
  },
  {
    method: "DELETE",
    path: "/api/cart/items/:id",
    auth: true,
    title: "Remove cart item",
    description: "Removes one current-user cart item."
  },
  {
    method: "DELETE",
    path: "/api/cart",
    auth: true,
    title: "Clear cart",
    description: "Removes all items from the current buyer cart."
  },
  {
    method: "POST",
    path: "/api/orders/checkout",
    auth: true,
    title: "Checkout",
    description: "Creates one buyer order and splits it into seller orders per store.",
    sampleBody: {
      shippingAddressId: "replace-with-address-id",
      paymentMethod: "CASH_ON_DELIVERY",
      notes: "Please deliver in the morning."
    }
  },
  {
    method: "GET",
    path: "/api/orders/:id",
    auth: true,
    title: "Order detail",
    description: "Shows one current-user buyer order."
  },
  {
    method: "POST",
    path: "/api/orders/:id/cancel",
    auth: true,
    title: "Cancel order",
    description: "Cancels a pending/confirmed buyer order and restores stock."
  },
  {
    method: "GET",
    path: "/api/orders/seller",
    auth: true,
    title: "Seller orders",
    description: "Lists seller orders for stores owned by the current seller."
  },
  {
    method: "PATCH",
    path: "/api/orders/seller/:id/status",
    auth: true,
    title: "Update seller order status",
    description: "Updates a seller order status for a store owned by the current seller."
  },
  {
    method: "POST",
    path: "/api/payments/webhook",
    auth: false,
    title: "Payment webhook",
    description: "Signed payment callback. Send x-agrifarm-signature as HMAC SHA256 over the JSON body.",
    sampleBody: {
      orderNumber: "replace-with-order-number",
      status: "PAID",
      provider: "demo-provider",
      providerRef: "demo-ref-001"
    }
  },
  {
    method: "GET",
    path: "/api/orders",
    auth: true,
    title: "My orders",
    description: "Lists current buyer orders, seller order splits, payments, and fulfillment records."
  },
  {
    method: "POST",
    path: "/api/categories",
    auth: true,
    title: "Create category",
    description: "Admin-only category creation."
  },
  {
    method: "PATCH",
    path: "/api/categories/:id",
    auth: true,
    title: "Update category",
    description: "Admin-only category update."
  },
  {
    method: "GET",
    path: "/api/admin/users",
    auth: true,
    title: "Admin users",
    description: "Admin-only user listing."
  },
  {
    method: "GET",
    path: "/api/admin/stores",
    auth: true,
    title: "Admin stores",
    description: "Admin-only store listing."
  },
  {
    method: "GET",
    path: "/api/admin/orders",
    auth: true,
    title: "Admin orders",
    description: "Admin-only order listing."
  },
  {
    method: "GET",
    path: "/api/admin/audit-logs",
    auth: true,
    title: "Admin audit logs",
    description: "Admin-only recent audit log listing."
  },
  {
    method: "PATCH",
    path: "/api/admin/users/:id/status",
    auth: true,
    title: "Admin update user status",
    description: "Admin-only user status changes."
  },
  {
    method: "PATCH",
    path: "/api/admin/stores/:id/status",
    auth: true,
    title: "Admin update store status",
    description: "Admin-only store status changes."
  }
];

@Controller("docs")
export class DocsController {
  @Get("openapi.json")
  openApi() {
    return {
      openapi: "3.0.0",
      info: {
        title: "Agrifarm API",
        version: "1.0.0",
        description: "Pasig multi-seller marketplace API"
      },
      servers: [{ url: "http://localhost:4000" }],
      paths: Object.fromEntries(
        endpoints.map((endpoint) => [
          endpoint.path,
          {
            [endpoint.method.toLowerCase()]: {
              summary: endpoint.title,
              description: endpoint.description,
              security: endpoint.auth ? [{ bearerAuth: [] }] : [],
              requestBody: endpoint.sampleBody
                ? {
                    required: true,
                    content: {
                      "application/json": {
                        example: endpoint.sampleBody
                      }
                    }
                  }
                : undefined,
              responses: {
                "200": { description: "Success" },
                "201": { description: "Created" },
                "400": { description: "Bad request" },
                "401": { description: "Unauthorized" }
              }
            }
          }
        ])
      ),
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer"
          }
        }
      }
    };
  }

  @Get()
  @Header("Content-Type", "text/html; charset=utf-8")
  docsUi() {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Agrifarm API Docs</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f7f8f4; color: #1d2520; }
    * { box-sizing: border-box; }
    body { margin: 0; }
    header { position: sticky; top: 0; z-index: 2; background: #ffffff; border-bottom: 1px solid #d9ded5; padding: 18px 24px; }
    main { max-width: 1180px; margin: 0 auto; padding: 24px; }
    h1 { margin: 0 0 4px; font-size: 28px; letter-spacing: 0; }
    p { margin: 0; color: #526057; line-height: 1.5; }
    .top { display: grid; grid-template-columns: 1fr minmax(280px, 460px); gap: 18px; align-items: end; max-width: 1180px; margin: 0 auto; }
    label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 6px; color: #2b352f; }
    input, textarea { width: 100%; border: 1px solid #c8d1c8; border-radius: 6px; padding: 10px 12px; font: inherit; background: #fff; color: #172019; }
    textarea { min-height: 150px; resize: vertical; font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace; font-size: 13px; line-height: 1.45; }
    .toolbar { display: flex; gap: 10px; margin-top: 8px; flex-wrap: wrap; }
    button, a.button { border: 1px solid #2d6a4f; background: #2d6a4f; color: white; border-radius: 6px; padding: 9px 12px; font: inherit; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; }
    button.secondary, a.secondary { background: #fff; color: #2d6a4f; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(330px, 1fr)); gap: 14px; margin-top: 18px; }
    .card { background: #fff; border: 1px solid #d9ded5; border-radius: 8px; padding: 16px; }
    .meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 10px; }
    .method { border-radius: 5px; padding: 4px 7px; font-size: 12px; font-weight: 800; color: #fff; min-width: 54px; text-align: center; }
    .GET { background: #2477b3; }
    .POST { background: #2d6a4f; }
    .DELETE { background: #b23b3b; }
    code { font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace; font-size: 13px; background: #eef2ec; padding: 3px 5px; border-radius: 5px; word-break: break-all; }
    h2 { font-size: 18px; margin: 0 0 8px; letter-spacing: 0; }
    .auth { font-size: 12px; border: 1px solid #d1a33d; color: #735100; background: #fff7df; padding: 3px 7px; border-radius: 999px; font-weight: 800; }
    .open { font-size: 12px; border: 1px solid #85baa0; color: #24583f; background: #eef9f2; padding: 3px 7px; border-radius: 999px; font-weight: 800; }
    .response { white-space: pre-wrap; background: #162018; color: #dcf3e3; border-radius: 8px; padding: 12px; min-height: 90px; max-height: 360px; overflow: auto; font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace; font-size: 13px; }
    .samples { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-top: 12px; }
    .small { font-size: 13px; color: #526057; }
    @media (max-width: 760px) { .top { grid-template-columns: 1fr; } main, header { padding-left: 14px; padding-right: 14px; } }
  </style>
</head>
<body>
  <header>
    <div class="top">
      <div>
        <h1>Agrifarm API Docs</h1>
        <p>OpenAPI JSON: <a href="/api/docs/openapi.json">/api/docs/openapi.json</a>. Seed login: <code>buyer@agrifarm.local</code> / <code>password123</code>.</p>
      </div>
      <div>
        <label for="token">Bearer Token</label>
        <input id="token" placeholder="Paste login token here" />
        <div class="toolbar">
          <button class="secondary" onclick="saveToken()">Save token</button>
          <button class="secondary" onclick="clearToken()">Clear</button>
        </div>
      </div>
    </div>
  </header>
  <main>
    <section class="card">
      <h2>Quick Start</h2>
      <p>1. Start services with <code>docker compose -f infra/docker/docker-compose.yml up -d</code>. 2. Run <code>npm run dev</code>. 3. Use <code>POST /api/auth/login</code>, copy the token, then test protected endpoints.</p>
      <div class="samples">
        <button onclick="quickLogin()">Login seeded buyer</button>
        <a class="button secondary" href="/api/barangays">View barangays</a>
        <a class="button secondary" href="/api/products?barangay=Kapitolyo">View Kapitolyo products</a>
      </div>
      <div id="quickResponse" class="response" style="margin-top:12px;">Response output appears here.</div>
    </section>
    <section class="grid">
      ${endpoints
        .map(
          (endpoint, index) => `
      <article class="card">
        <div class="meta">
          <span class="method ${endpoint.method}">${endpoint.method}</span>
          <code>${endpoint.path}${endpoint.sampleQuery ?? ""}</code>
          <span class="${endpoint.auth ? "auth" : "open"}">${endpoint.auth ? "AUTH" : "OPEN"}</span>
        </div>
        <h2>${escapeHtml(endpoint.title)}</h2>
        <p>${escapeHtml(endpoint.description)}</p>
        ${
          endpoint.sampleBody
            ? `<label for="body-${index}" style="margin-top:12px;">JSON Body</label><textarea id="body-${index}">${escapeHtml(JSON.stringify(endpoint.sampleBody, null, 2))}</textarea>`
            : `<p class="small" style="margin-top:12px;">No request body.</p>`
        }
        <div class="toolbar">
          <button onclick="sendRequest(${index})">Send</button>
          <button class="secondary" onclick="copyCurl(${index})">Copy curl</button>
        </div>
      </article>`
        )
        .join("")}
    </section>
  </main>
  <script>
    const endpoints = ${JSON.stringify(endpoints)};
    const tokenInput = document.getElementById("token");
    tokenInput.value = localStorage.getItem("agrifarmToken") || "";

    function saveToken() {
      localStorage.setItem("agrifarmToken", tokenInput.value.trim());
    }

    function clearToken() {
      tokenInput.value = "";
      localStorage.removeItem("agrifarmToken");
    }

    function pathWithQuery(endpoint) {
      return endpoint.path + (endpoint.sampleQuery || "");
    }

    async function quickLogin() {
      const responseBox = document.getElementById("quickResponse");
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "buyer@agrifarm.local", password: "password123" })
        });
        const data = await response.json();
        if (data.token) {
          tokenInput.value = data.token;
          saveToken();
        }
        responseBox.textContent = JSON.stringify(data, null, 2);
      } catch (error) {
        responseBox.textContent = String(error);
      }
    }

    async function sendRequest(index) {
      const endpoint = endpoints[index];
      const bodyEl = document.getElementById("body-" + index);
      const responseBox = document.getElementById("quickResponse");
      const headers = { "Content-Type": "application/json" };
      const token = tokenInput.value.trim();
      if (endpoint.auth && token) headers.Authorization = "Bearer " + token;

      try {
        const response = await fetch(pathWithQuery(endpoint), {
          method: endpoint.method,
          headers,
          body: bodyEl ? bodyEl.value : undefined
        });
        const text = await response.text();
        try {
          responseBox.textContent = JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          responseBox.textContent = text;
        }
      } catch (error) {
        responseBox.textContent = String(error);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function copyCurl(index) {
      const endpoint = endpoints[index];
      const bodyEl = document.getElementById("body-" + index);
      const token = tokenInput.value.trim();
      const parts = ["curl", "-X", endpoint.method, "http://localhost:4000" + pathWithQuery(endpoint), "-H", "'Content-Type: application/json'"];
      if (endpoint.auth && token) parts.push("-H", "'Authorization: Bearer " + token + "'");
      if (bodyEl) parts.push("-d", "'" + bodyEl.value.replace(/'/g, "'\\\\''") + "'");
      await navigator.clipboard.writeText(parts.join(" "));
    }
  </script>
</body>
</html>`;
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
