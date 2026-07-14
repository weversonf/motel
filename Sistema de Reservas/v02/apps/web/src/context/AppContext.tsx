import { createContext, useContext, useState, type ReactNode } from "react";

interface User {
  uid: string;
  nome: string;
  email: string;
  role: "superadmin" | "admin" | "funcionario";
  motelId?: string;
}

interface AppContextType {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  token: string | null;
  setToken: (t: string | null) => void;
}

const AppContext = createContext<AppContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  token: null,
  setToken: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (u: User) => setUser(u);
  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AppContext.Provider value={{ user, login, logout, token, setToken }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAuth() {
  return useContext(AppContext);
}
