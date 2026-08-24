const PORTAL_TOKEN_KEY = "lis_client_portal_token";

export function getPortalToken(): string | null {
  return sessionStorage.getItem(PORTAL_TOKEN_KEY);
}

export function setPortalToken(token: string): void {
  sessionStorage.setItem(PORTAL_TOKEN_KEY, token);
}

export function clearPortalToken(): void {
  sessionStorage.removeItem(PORTAL_TOKEN_KEY);
}
