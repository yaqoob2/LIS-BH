import { apiRequest } from "./client";
import type {
  AuthMeResponse,
  LoginRequest,
  LoginResponse,
} from "../types/auth";

export function login(data: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMe(): Promise<AuthMeResponse> {
  return apiRequest<AuthMeResponse>("/auth/me");
}
