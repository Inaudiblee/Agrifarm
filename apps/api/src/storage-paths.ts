import { join } from "node:path";

export function apiStorageRoot() {
  const cwd = process.cwd();
  return cwd.replace(/\\/g, "/").endsWith("/apps/api") ? join(cwd, "uploads") : join(cwd, "apps", "api", "uploads");
}
