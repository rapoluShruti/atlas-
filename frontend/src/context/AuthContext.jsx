import { createContext, useContext, useEffect, useState } from "react";

import { getProfile, loginUser, registerUser } from "../services/authService.js";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "atlas_auth_token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(AUTH_STORAGE_KEY) || "");
  const [isLoading, setIsLoading] = useState(true);

  const saveToken = (nextToken) => {
    if (nextToken) {
      localStorage.setItem(AUTH_STORAGE_KEY, nextToken);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    setToken(nextToken || "");
  };

  const handleAuthSuccess = (data) => {
    saveToken(data.token);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
    });
  };

  const login = async (payload) => {
    const data = await loginUser(payload);
    handleAuthSuccess(data);
    return data;
  };

  const register = async (payload) => {
    const data = await registerUser(payload);
    handleAuthSuccess(data);
    return data;
  };

  const logout = () => {
    saveToken("");
    setUser(null);
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getProfile(token);
        setUser(profile);
      } catch (error) {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

