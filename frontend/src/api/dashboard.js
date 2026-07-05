import { get } from "./client";

export function getDashboard() {
  return get("/dashboard");
}
