import { type AxiosRequestConfig } from "axios";
import { http } from "./http";
import type { ApiError } from "./types";

function toApiError(err: unknown): ApiError {
  // AxiosError tem um formato bem padrão
  if (typeof err === "object" && err && "response" in err) {
    const anyErr = err as any;
    return {
      status: anyErr.response?.status,
      message: anyErr.response?.data?.message ?? anyErr.message ?? "Erro na requisição",
      details: anyErr.response?.data,
    };
  }
  return { message: "Erro inesperado", details: err };
}

export const apiSlice = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await http.get<T>(url, config);
      return res.data;
    } catch (err) {
      throw toApiError(err);
    }
  },

  async post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await http.post<T>(url, body, config);
      return res.data;
    } catch (err) {
      throw toApiError(err);
    }
  },

  async put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await http.put<T>(url, body, config);
      return res.data;
    } catch (err) {
      throw toApiError(err);
    }
  },

  async patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await http.patch<T>(url, body, config);
      return res.data;
    } catch (err) {
      throw toApiError(err);
    }
  },

  async del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await http.delete<T>(url, config);
      return res.data;
    } catch (err) {
      throw toApiError(err);
    }
  },
};
