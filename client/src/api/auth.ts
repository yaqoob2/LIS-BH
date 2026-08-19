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

export function forgotPassword(email: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      token,
      newPassword,
    }),
  });
}
