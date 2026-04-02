import axios from "axios";
import type { ApiResponse } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function fetchApi<T>(url: string): Promise<T> {
  const { data } = await api.get<ApiResponse<T>>(url);
  if (!data.success) throw new Error(data.error ?? "Unknown error");
  return data.data as T;
}

export async function postApi<T>(url: string, body: unknown): Promise<T> {
  const { data } = await api.post<ApiResponse<T>>(url, body);
  if (!data.success) throw new Error(data.error ?? "Unknown error");
  return data.data as T;
}

export async function putApi<T>(url: string, body: unknown): Promise<T> {
  const { data } = await api.put<ApiResponse<T>>(url, body);
  if (!data.success) throw new Error(data.error ?? "Unknown error");
  return data.data as T;
}

export async function deleteApi<T>(url: string): Promise<T> {
  const { data } = await api.delete<ApiResponse<T>>(url);
  if (!data.success) throw new Error(data.error ?? "Unknown error");
  return data.data as T;
}

export async function postFormApi<T>(url: string, formData: FormData): Promise<T> {
  const { data } = await api.post<ApiResponse<T>>(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (!data.success) throw new Error(data.error ?? "Unknown error");
  return data.data as T;
}

export default api;
