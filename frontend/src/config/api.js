const getApiHost = () => {
  if (typeof window === "undefined") {
    return "http://localhost:5000";
  }

  return window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : `${window.location.protocol}//${window.location.host}`;
};

export const API_BASE_URL = `${getApiHost()}/api`;

export const API_ROUTES = {
  health: `${API_BASE_URL}/health`,
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  profile: `${API_BASE_URL}/auth/me`,
};

