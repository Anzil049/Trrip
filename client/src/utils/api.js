const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let authHandlers = {
  onLogout: null,
};

export const setAuthHandlers = (handlers = {}) => {
  authHandlers = {
    ...authHandlers,
    ...handlers,
  };
};

const shouldRetryAuth = (path, skipAuthRetry) =>
  !skipAuthRetry && !path.startsWith("/auth/login") && !path.startsWith("/auth/register") && !path.startsWith("/auth/verify-otp") && !path.startsWith("/auth/refresh") && !path.startsWith("/auth/logout");

const rawRequest = async (path, { method = "GET", body, isForm = false } = {}) => {
  const headers = {};

  if (!isForm && body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
};

const request = async (path, options = {}, retried = false) => {
  const { skipAuthRetry = false } = options;
  const { response, data } = await rawRequest(path, options);

  if (!response.ok) {
    if (response.status === 401 && shouldRetryAuth(path, skipAuthRetry) && !retried) {
      try {
        const refreshResult = await rawRequest("/auth/refresh", { method: "POST" });
        if (refreshResult.response.ok) {
          return request(path, options, true);
        }
      } catch {
        // fall through to logout handling below
      }

      if (authHandlers.onLogout) {
        authHandlers.onLogout();
      }
    }

    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const api = {
  get: (path) => request(path),
  post: (path, body, options = {}) => request(path, { method: "POST", body, ...options }),
  patch: (path, body, options = {}) => request(path, { method: "PATCH", body, ...options }),
  delete: (path, options = {}) => request(path, { method: "DELETE", ...options }),
  upload: (path, formData, options = {}) => request(path, { method: "POST", body: formData, isForm: true, ...options }),
  refresh: () => request("/auth/refresh", { method: "POST", skipAuthRetry: true }),
  logout: () => request("/auth/logout", { method: "POST", skipAuthRetry: true }),
};
