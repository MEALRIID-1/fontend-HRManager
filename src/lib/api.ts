import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from "axios";
import { storage } from "./utils";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ── Axios instance ──────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request interceptor — inject JWT ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = storage.get<string>("rh_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 / errors ──────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      storage.remove("rh_token");
      storage.remove("rh_user");
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login?session=expired";
      }
    }

    const message =
      (error.response?.data as { message?: string })?.message ??
      error.message ??
      "Une erreur est survenue";

    return Promise.reject({ ...error, friendlyMessage: message });
  }
);

export default api;

// ── Generic CRUD helpers ─────────────────────────────────────────────────────
export const apiGet    = <T>(url: string, params?: object) =>
  api.get<T>(url, { params }).then((r) => r.data);

export const apiPost   = <T>(url: string, data?: object) =>
  api.post<T>(url, data).then((r) => r.data);

export const apiPut    = <T>(url: string, data?: object) =>
  api.put<T>(url, data).then((r) => r.data);

export const apiPatch  = <T>(url: string, data?: object) =>
  api.patch<T>(url, data).then((r) => r.data);

export const apiDelete = <T>(url: string) =>
  api.delete<T>(url).then((r) => r.data);
