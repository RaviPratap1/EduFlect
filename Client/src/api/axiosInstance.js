import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL + "/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

// ── REQUEST INTERCEPTOR ───────────────────────────────────────
// Har request ke saath access token attach karo
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── RESPONSE INTERCEPTOR ──────────────────────────────────────
// 401 aane par token refresh karo, failed requests retry karo
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

const clearAuthAndRedirect = () => {
  localStorage.removeItem("accessToken");

  // Protected routes pe hi redirect karo — home page pe nahi
  const protectedPrefixes = ["/dashboard", "/learn"];
  const isProtected = protectedPrefixes.some((r) =>
    window.location.pathname.startsWith(r),
  );

  if (isProtected) {
    // Hard redirect avoid karne ke liye — Redux dispatch ya navigate use karo
    // Yahan window.location use karna last resort hai
    window.location.replace("/login");
  }
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register")
    ) {
      return Promise.reject(error);
    }

    // Agar already refresh ho rahi hai toh queue mein daalo
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(Promise.reject);
    }

    // Token refresh shuru karo
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // ✅ Sahi URL — BASE_URL use karo, alag axios instance nahi
      const { data } = await api.post("/auth/refresh-token");
      const newToken = data.data.accessToken;

      // Naya token save karo
      localStorage.setItem("accessToken", newToken);
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

      // Queue mein baaki requests ko resolve karo
      processQueue(null, newToken);

      // Original failed request retry karo
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh bhi fail ho gaya — logout karo
      processQueue(refreshError, null);
      clearAuthAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
