import { del, get, patch, post } from "./client";

export function listPrompts(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });
  const query = params.toString();
  return get(`/prompts${query ? `?${query}` : ""}`);
}

export function createPrompt(data) {
  return post("/prompts", data);
}

export function updatePrompt(promptId, data) {
  return patch(`/prompts/${promptId}`, data);
}

export function deletePrompt(promptId) {
  return del(`/prompts/${promptId}`);
}
