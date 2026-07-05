import { get } from "./client";

export function listCompanies() {
  return get("/companies");
}

export function getCompany(companyId) {
  return get(`/companies/${companyId}`);
}

export function listCompanyCategories(companyId) {
  return get(`/companies/${companyId}/categories`);
}

export function listCompanyTasks(companyId) {
  return get(`/companies/${companyId}/tasks`);
}

export function listCompanyKPI(companyId) {
  return get(`/companies/${companyId}/kpi`);
}

export function listCompanyPrompts(companyId) {
  return get(`/companies/${companyId}/prompts`);
}

export function listCompanyWorkflows(companyId) {
  return get(`/companies/${companyId}/workflows`);
}
