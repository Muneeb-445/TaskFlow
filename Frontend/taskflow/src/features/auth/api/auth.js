// client have the main Backend BaseUrl API
import api from '../../../shared/api/client'


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

export async function forgotPassword(email) {
  const response = await api.post("/auth/forgot-password", {
    email,
  });

  return response.data;
}

export async function resetPassword(token, newPassword) {
  const response = await api.post("/auth/reset-password", {
    token,
    new_password: newPassword,
  });

  return response.data;
}