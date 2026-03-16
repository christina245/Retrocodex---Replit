import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface UserData {
  username: string;
  email: string;
  profilePhoto: string;
  currentLocation: string;
  showCurrentLocation: boolean;
  placesLived: string[];
  showPlacesLived: boolean;
  favoriteTags: string[];
  misinfoSource: string;
  bio: string;
}

interface AuthContextType {
  user: UserData | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  register: (userData: Partial<UserData>) => void;
  updateUser: (partial: Partial<UserData>) => void;
  logout: () => void;
}

const DUMMY_USER: UserData = {
  username: "UnlearnExplorer",
  email: "test@test.com",
  profilePhoto: "",
  currentLocation: "New York, United States",
  showCurrentLocation: false,
  placesLived: ["United Kingdom", "Canada", "Australia"],
  showPlacesLived: false,
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
  bio: "Creator of Retrocodex. I created this site because of how in-demand I saw the concept was and was horrified that I might be acting on untrue beliefs at any given moment. You never know what facts could one day save your life!",
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: () => false,
  register: () => {},
  updateUser: () => {},
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

  const register = useCallback((userData: Partial<UserData>) => {
    setUser({ ...DUMMY_USER, ...userData });
  }, []);

  const updateUser = useCallback((partial: Partial<UserData>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
