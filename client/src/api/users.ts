import { apiRequest } from "./client";

import type {
  CreateUserRequest,
  InternalUser,
  UpdateUserRequest,
} from "../types/user";

export function getUsers(): Promise<InternalUser[]> {
  return apiRequest<InternalUser[]>("/users");
}

export function createUser(data: CreateUserRequest): Promise<InternalUser> {
  return apiRequest<InternalUser>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateUser(
  id: string,
  data: UpdateUserRequest,
): Promise<InternalUser> {
  return apiRequest<InternalUser>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
