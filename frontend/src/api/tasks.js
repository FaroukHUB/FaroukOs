import { del, get, patch, post } from "./client";

export function listTasks(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });
  const query = params.toString();
  return get(`/tasks${query ? `?${query}` : ""}`);
}

export function getTodayTasks() {
  return get("/tasks/today");
}

export function getWeekTasks() {
  return get("/tasks/week");
}

export function createTask(data) {
  return post("/tasks", data);
}

export function updateTask(taskId, data) {
  return patch(`/tasks/${taskId}`, data);
}

export function deleteTask(taskId) {
  return del(`/tasks/${taskId}`);
}
