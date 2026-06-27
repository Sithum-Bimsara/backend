import axios from "axios";
import { supabase } from "./supabase";

export const api = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Attach CSRF token from cookie to header
    if (typeof window !== "undefined") {
      const csrfToken = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("csrf_token="));
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken.split("=")[1];
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor with silent session renewal
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    // Prevent infinite loops on auth endpoints
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/refresh") || 
                          originalRequest?.url?.includes("/auth/login");

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      // Attempt silent Supabase session refresh
      try {
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        
        if (!refreshError && data.session?.access_token) {
          const token = data.session.access_token;
          
          // Call backend refresh endpoint to update HTTP-only cookie
          await api.post("/auth/refresh", { token });
          
          // Retry original request
          return api(originalRequest);
        }
      } catch (refreshErr) {
        console.error("Session refresh failed:", refreshErr);
      }

      // If refresh fails or returns 401, redirect to login
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?expired=true";
      }
    }

    if (status === 500) {
      console.error("Server error:", error.response?.data);
    }

    // Standardize error message extraction
    let cleanMessage = "An unexpected error occurred";
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      if (responseData && typeof responseData === "object") {
        if ("message" in responseData && typeof responseData.message === "string") {
          cleanMessage = responseData.message;
        } else if ("error" in responseData && responseData.error && typeof responseData.error === "object" && "message" in responseData.error) {
          cleanMessage = (responseData.error as { message: string }).message;
        }
      } else if (error.message) {
        cleanMessage = error.message;
      }
      // Override the error message with our cleaner extracted message
      error.message = cleanMessage;
    }
    
    // Reject with the original error object to preserve all Axios metadata
    return Promise.reject(error);
  }
);
