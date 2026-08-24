import { apiRequest } from "./client";

import type {
  Client,
  ClientWithCases,
  CreateClientRequest,
  CreateClientResponse,
  UpdateClientRequest,
} from "../types/client";

export function getClients(): Promise<Client[]> {
  return apiRequest<Client[]>("/clients");
}

export function getClient(id: string): Promise<ClientWithCases> {
  return apiRequest<ClientWithCases>(`/clients/${id}`);
}

export function createClient(
  data: CreateClientRequest,
): Promise<CreateClientResponse> {
  return apiRequest<CreateClientResponse>("/clients", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateClient(
  id: string,
  data: UpdateClientRequest,
): Promise<Client> {
  return apiRequest<Client>(`/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
