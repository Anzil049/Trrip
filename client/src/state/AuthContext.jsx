import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthHandlers } from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    setAuthHandlers({
      onLogout: () => {
        if (active) setUser(null);
      },
    });

    api
      .get("/auth/me")
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      setAuthHandlers({ onLogout: null });
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      logout: async () => {
        try {
          await api.logout();
        } finally {
          setUser(null);
        }
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
