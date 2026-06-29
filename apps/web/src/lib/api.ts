export function getApiBase() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return base.replace(/\/$/, "");
}

export function resolveMediaUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return `${getApiBase()}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function parseApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(data.message)) {
      return data.message.join(". ");
    }
    if (typeof data.message === "string") {
      return data.message;
    }
  } catch {
    // ignore JSON parse errors
  }
  return response.statusText || "Something went wrong. Please try again.";
}
