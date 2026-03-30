import { API_ROUTES } from "../config/api.js";

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export const registerUser = (payload) =>
  request(API_ROUTES.register, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const loginUser = (payload) =>
  request(API_ROUTES.login, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getProfile = (token) =>
  request(API_ROUTES.profile, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

