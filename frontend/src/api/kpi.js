import { get, post } from "./client";

export function listKPI(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });
  const query = params.toString();
  return get(`/kpi${query ? `?${query}` : ""}`);
}

export function saveKPIEntry(data) {
  return post("/kpi", data);
}
