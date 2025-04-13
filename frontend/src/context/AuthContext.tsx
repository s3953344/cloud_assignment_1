import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  login: (username: string, email: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const USER_KEY = "USER";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(USER_KEY) !== null;
  });
  
  const login = (username: string, email: string) => {
    setIsAuthenticated(true);
    sessionStorage.setItem(USER_KEY, JSON.stringify({ username, email }));
  };
  
  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(USER_KEY);
  };

  // useEffect(() => {
  //   const handleUnload = () => {
  //     // Optional: Clear auth info on unload if using session-based auth
  //     logout();
  //   };
  //   window.addEventListener("beforeunload", handleUnload);
  //   return () => window.removeEventListener("beforeunload", handleUnload);
  // }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
