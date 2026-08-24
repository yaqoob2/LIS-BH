import { ApiError } from "./client";

import type {
  ClientPortalAccessResponse,
  ClientPortalData,
} from "../types/clientPortal";

const API_URL = import.meta.env.VITE_API_URL;

async function portalRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Something went wrong.";

    try {
      const data = await response.json();

      if (typeof data?.message === "string") {
        message = data.message;
      } else if (Array.isArray(data?.message)) {
        message = data.message[0] ?? message;
      }
    } catch {
      // Keep fallback message.
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function accessClientPortal(
  token: string,
): Promise<ClientPortalAccessResponse> {
  return portalRequest<ClientPortalAccessResponse>("/client-portal/access", {
    method: "POST",
    body: JSON.stringify({
      token,
    }),
  });
}

export function getClientPortal(
  accessToken: string,
): Promise<ClientPortalData> {
  return portalRequest<ClientPortalData>("/client-portal/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
