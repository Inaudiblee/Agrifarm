import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderCallbackPage({
  origin,
  code,
  state,
  error,
  errorDescription,
}: {
  origin: string;
  code: string | null;
  state: string | null;
  error: string | null;
  errorDescription: string | null;
}) {
  const isError = Boolean(error);
  const callbackUrl = `${origin}/api/auth/facebook/callback`;
  const title = isError ? "Facebook callback error" : "Facebook callback received";
  const status = isError ? "Facebook returned an error." : "Facebook redirected back to AgriFarm successfully.";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      :root {
        color-scheme: light;
        font-family: Arial, Helvetica, sans-serif;
      }

      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #f7efe1, #e7f2d2);
        color: #17250f;
      }

      main {
        width: min(100% - 32px, 720px);
        border: 1px solid rgba(36, 20, 9, 0.12);
        border-radius: 18px;
        padding: 28px;
        background: rgba(255, 253, 248, 0.92);
        box-shadow: 0 24px 64px rgba(36, 20, 9, 0.14);
      }

      h1 {
        margin: 0 0 10px;
        color: ${isError ? "#9f1d1d" : "#145c2a"};
        font-size: clamp(1.8rem, 5vw, 3rem);
        line-height: 1;
      }

      p {
        margin: 0 0 18px;
        color: #4a4937;
        font-weight: 700;
        line-height: 1.6;
      }

      dl {
        display: grid;
        gap: 10px;
        margin: 0 0 22px;
      }

      div {
        display: grid;
        gap: 4px;
        border: 1px solid rgba(20, 92, 42, 0.12);
        border-radius: 12px;
        padding: 12px;
        background: #fffaf0;
      }

      dt {
        color: #31551f;
        font-size: 0.78rem;
        font-weight: 900;
        text-transform: uppercase;
      }

      dd {
        overflow-wrap: anywhere;
        margin: 0;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
        font-size: 0.9rem;
      }

      a {
        display: inline-flex;
        min-height: 42px;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        padding: 0 16px;
        background: #145c2a;
        color: #ffffff;
        font-weight: 900;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${status} This test route only confirms that your Facebook Developer redirect URI works. It does not exchange the code for a real AgriFarm session yet.</p>
      <dl>
        <div>
          <dt>Callback route</dt>
          <dd>${escapeHtml(callbackUrl)}</dd>
        </div>
        <div>
          <dt>Code</dt>
          <dd>${code ? escapeHtml(code) : "No code received"}</dd>
        </div>
        <div>
          <dt>State</dt>
          <dd>${state ? escapeHtml(state) : "No state received"}</dd>
        </div>
        <div>
          <dt>Error</dt>
          <dd>${error ? escapeHtml(error) : "None"}</dd>
        </div>
        <div>
          <dt>Error description</dt>
          <dd>${errorDescription ? escapeHtml(errorDescription) : "None"}</dd>
        </div>
      </dl>
      <a href="/login">Back to login</a>
    </main>
  </body>
</html>`;
}

export function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const error = searchParams.get("error");
  const html = renderCallbackPage({
    origin,
    code: searchParams.get("code"),
    state: searchParams.get("state"),
    error,
    errorDescription: searchParams.get("error_description") ?? searchParams.get("error_reason"),
  });

  return new NextResponse(html, {
    status: error ? 400 : 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
