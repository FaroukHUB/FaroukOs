import { get, patch } from "./client";

export function listAssignees() {
  return get("/assignees");
}

export function updateAssigneeLabel(key, label) {
  return patch(`/assignees/${key}`, { label });
}
