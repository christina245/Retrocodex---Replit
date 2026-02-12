import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface UserData {
  username: string;
  email: string;
  profilePhoto: string;
  currentLocation: string;
  placesLived: string[];
  favoriteTags: string[];
  misinfoSource: string;
}

interface AuthContextType {
  user: UserData | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const DUMMY_USER: UserData = {
  username: "UnlearnExplorer",
  email: "test@test.com",
  profilePhoto: "",
  currentLocation: "New York, United States",
  placesLived: ["London, United Kingdom", "Toronto, Canada", "Sydney, Australia"],
  favoriteTags: [
    "ancient civilizations",
    "nutrition myths",
    "evolution",
    "brain science",
    "climate change",
    "body language",
    "sleep",
    "vaccines",
    "dinosaurs",
    "space exploration",
  ],
  misinfoSource: "",
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);

  const login = useCallback((email: string, password: string): boolean => {
    if (email === "test@test.com" && password === "password") {
      setUser(DUMMY_USER);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
