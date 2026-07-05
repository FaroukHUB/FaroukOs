const BASE_URL = "/api";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function get(path) {
  return request(path);
}

export function post(path, data) {
  return request(path, { method: "POST", body: JSON.stringify(data) });
}

export function patch(path, data) {
  return request(path, { method: "PATCH", body: JSON.stringify(data) });
}

export function del(path) {
  return request(path, { method: "DELETE" });
}
