const base = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const sessionKey = "helpdesk.session";
export function readSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(sessionKey));
    return session?.token && session.expires_at > Date.now() ? session : null;
  } catch {
    return null;
  }
}
export function saveSession(session) {
  if (session) sessionStorage.setItem(sessionKey, JSON.stringify(session));
  else sessionStorage.removeItem(sessionKey);
}
export async function api(path, { method = "GET", body, signal } = {}) {
  const session = readSession();
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Cannot reach the helpdesk API. Check that the Laravel server is running and try again.",
    );
  }
  if (response.status === 204) return null;
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The API returned an unexpected response. Check the API URL and server configuration.",
    );
  }
  if (!response.ok) {
    if (response.status === 401 && path !== "/auth/login") {
      saveSession(null);
      window.dispatchEvent(new Event("helpdesk:unauthorized"));
    }
    const error = new Error(data.message || "The request could not be completed.");
    error.fields = data.errors || {};
    error.status = response.status;
    throw error;
  }
  return data;
}
