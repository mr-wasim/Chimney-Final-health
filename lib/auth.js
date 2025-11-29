import { cookies } from "next/headers";

export function isAdminLoggedIn() {
  const cookieStore = cookies();
  return cookieStore.get("admin_auth")?.value === "ok";
}
