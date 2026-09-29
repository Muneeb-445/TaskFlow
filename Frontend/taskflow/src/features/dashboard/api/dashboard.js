import api from "../../../shared/api/client";

export async function getDashboard() {
  const response = await api.get("/dashboard");
  return response.data;
}