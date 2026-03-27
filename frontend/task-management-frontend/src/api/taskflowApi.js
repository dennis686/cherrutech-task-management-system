const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

function buildHeaders(token, hasJsonBody = true) {
  const headers = {};

  if (hasJsonBody) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Token ${token}`;
  }

  return headers;
}

async function request(path, { token = "", hasJsonBody = true, ...options } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...buildHeaders(token, hasJsonBody),
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    throw new Error("Unable to reach the backend. Check that the Django server is running.");
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.error || data?.detail || "Request failed");
  }

  return data;
}

export function fetchTasks(token) {
  return request("/tasks/", { token, hasJsonBody: false });
}

export function fetchTaskStatistics(token) {
  return request("/tasks/statistics/", { token, hasJsonBody: false });
}

export function createTask(token, payload) {
  return request("/tasks/", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateTask(token, taskId, payload) {
  return request(`/tasks/${taskId}/`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteTaskRequest(token, taskId) {
  return request(`/tasks/${taskId}/`, {
    method: "DELETE",
    token,
    hasJsonBody: false,
  });
}

export function sendRegistrationOtp(payload) {
  return request("/auth/send-otp/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyRegistrationOtp(payload) {
  return request("/auth/verify-otp/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginRequest(payload) {
  return request("/auth/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logoutRequest(token) {
  return request("/auth/logout/", {
    method: "POST",
    token,
    hasJsonBody: false,
  });
}

export { API_BASE_URL };
