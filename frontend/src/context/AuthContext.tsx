import { createContext, useContext, useState } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  login: (username: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_KEY = "USER";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(USER_KEY) !== null;
  });
  

  const login = (username: string) => {
    setIsAuthenticated(true);
    localStorage.setItem(USER_KEY, username);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(USER_KEY);
  };

  // useEffect(() => {
  //   const handleUnload = () => {
  //     // Optional: Clear auth info on unload if using session-based auth
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
