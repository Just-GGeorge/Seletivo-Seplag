import { apiSlice } from "../api/apiSlice";
import type { Tokens } from "./tokenStore";

export type LoginRequest = { login: string; senha: string };

// ajuste conforme seu backend
export async function login(req: LoginRequest): Promise<Tokens> {
  return apiSlice.post<Tokens>("/auth/login", req);
}
