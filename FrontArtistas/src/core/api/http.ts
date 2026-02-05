import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { tokenStore } from "../auth/tokenStore";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export const http: AxiosInstance = axios.create({
  baseURL,
  timeout: 20000,
});

// ---- Request interceptor: injeta Bearer token
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  // evita refresh concorrente
  if (refreshPromise) return refreshPromise;

  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) throw new Error("Missing refresh token");

  refreshPromise = axios
    .post(
      `${baseURL}/auth/refresh`,
      { refreshToken },
      { timeout: 20000 }
    )
    .then((res) => {
      // Ajuste estes campos conforme seu backend retorna
      const newAccess = res.data.accessToken as string;
      const newRefresh = (res.data.refreshToken as string) ?? refreshToken;

      tokenStore.setTokens({ accessToken: newAccess, refreshToken: newRefresh });
      return newAccess;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

// ---- Response interceptor: trata 401 e tenta refresh
http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    if (!original) return Promise.reject(error);

    // Se já tentou, não fica em loop
    if ((status === 401 || status === 403) && !original._retry) {
      original._retry = true;

      try {
        const newAccess = await refreshAccessToken();
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        return http.request(original);
      } catch (e) {
        tokenStore.clear();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
