// client have the main Backend BaseUrl API
import api from "./client";


// User Registeration API
export async function registerUser(userData) {
  const response = await api.post("/auth/register", userData);

  return response.data;
}

// User Login API
export async function loginUser(credentials) {
  const response = await api.post("/auth/login", credentials);

  return response.data;
}