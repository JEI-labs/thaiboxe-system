import { getServerAuthSession } from "@/server/auth";
import axios, { AxiosError } from "axios";

export const axiosApi = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

axiosApi.interceptors.request.use(async (config: any) => {
  const session = await getServerAuthSession();
  const token = session?.user.access_token ?? null;

  if (!config.headers.Authorization) {
    config.headers.Authorization = token ? `Bearer ${token ?? ""}` : undefined;
  }

  return config;
});

axiosApi.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    if (error instanceof AxiosError) {
      console.log({
        url: error.config?.url,
        message: error.message,
        responseMessage: error.response?.data,
        error_data:
          typeof error.response?.data === "object"
            ? JSON.stringify(error.response.data)
            : error.response?.data,
      });
    }

    error.errors = Object.values(error?.response?.data?.data || [])[0] || [
        error?.response?.data?.message,
      ] || [error.message];

    return Promise.reject(error);
  },
);
