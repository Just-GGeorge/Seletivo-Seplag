import { apiSlice } from "../../core/api/apiSlice";

type RegisterPayload = {
  nome: string;
  email: string;
  senha: string;
};

export async function registrar(payload: RegisterPayload) {
  return apiSlice.post<void>("/auth/registrar", payload);
}
