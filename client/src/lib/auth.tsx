import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

export interface UserData {
  id: string;
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
  allowFollows: boolean;
  allowPublicProfile: boolean;
  notifyFollowsWeb: boolean;
  notifyFollowsEmail: boolean;
  notifyCommentsWeb: boolean;
  notifyCommentsEmail: boolean;
  notifyFactUpdatesWeb: boolean;
  notifyFactUpdatesEmail: boolean;
  isAdmin: boolean;
  emailVerified: boolean;
}

interface AuthContextType {
  user: UserData | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  updateUser: (partial: Partial<Omit<UserData, "id" | "email">>) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  avatarUrl?: string;
  currentLocation?: string;
  showCurrentLocation?: boolean;
  placesLived?: string[];
  showPlacesLived?: boolean;
  favoriteTags?: string[];
  misinfoSource?: string;
  bio?: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  updateUser: async () => {},
  logout: async () => {},
  refetchUser: async () => {},
});

function mapApiResponse(data: any): UserData {
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    profilePhoto: data.profilePhoto || "",
    currentLocation: data.currentLocation || "",
    showCurrentLocation: data.showCurrentLocation ?? false,
    placesLived: data.placesLived || [],
    showPlacesLived: data.showPlacesLived ?? false,
    favoriteTags: data.favoriteTags || [],
    misinfoSource: data.misinfoSource || "",
    bio: data.bio || "",
    allowFollows: data.allowFollows ?? true,
    allowPublicProfile: data.allowPublicProfile ?? true,
    notifyFollowsWeb: data.notifyFollowsWeb ?? true,
    notifyFollowsEmail: data.notifyFollowsEmail ?? true,
    notifyCommentsWeb: data.notifyCommentsWeb ?? true,
    notifyCommentsEmail: data.notifyCommentsEmail ?? true,
    notifyFactUpdatesWeb: data.notifyFactUpdatesWeb ?? true,
    notifyFactUpdatesEmail: data.notifyFactUpdatesEmail ?? true,
    isAdmin: data.isAdmin ?? false,
    emailVerified: data.emailVerified ?? false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(mapApiResponse(data));
      } else {
        setUser(null);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) setUser(mapApiResponse(data));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      if (user) refetchUser();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, refetchUser]);

  const login = useCallback(async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(mapApiResponse(data));
        return { success: true };
      }
      return { success: false, error: data.message || "Invalid email or password." };
    } catch {
      return { success: false, error: "Something went wrong. Please try again." };
    }
  }, []);

  const register = useCallback(async (registerData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(mapApiResponse(data));
        return { success: true };
      }
      return { success: false, error: data.message || "Registration failed." };
    } catch {
      return { success: false, error: "Something went wrong. Please try again." };
    }
  }, []);

  const updateUser = useCallback(async (partial: Partial<Omit<UserData, "id" | "email">>) => {
    const payload: Record<string, any> = {};
    if (partial.username !== undefined) payload.username = partial.username;
    if (partial.bio !== undefined) payload.bio = partial.bio;
    if (partial.profilePhoto !== undefined) payload.avatarUrl = partial.profilePhoto;
    if (partial.currentLocation !== undefined) payload.currentLocation = partial.currentLocation;
    if (partial.showCurrentLocation !== undefined) payload.showCurrentLocation = partial.showCurrentLocation;
    if (partial.placesLived !== undefined) payload.placesLived = partial.placesLived;
    if (partial.showPlacesLived !== undefined) payload.showPlacesLived = partial.showPlacesLived;
    if (partial.favoriteTags !== undefined) payload.favoriteTags = partial.favoriteTags;
    if (partial.misinfoSource !== undefined) payload.misinfoSource = partial.misinfoSource;
    if (partial.allowFollows !== undefined) payload.allowFollows = partial.allowFollows;
    if (partial.allowPublicProfile !== undefined) payload.allowPublicProfile = partial.allowPublicProfile;
    if (partial.notifyFollowsWeb !== undefined) payload.notifyFollowsWeb = partial.notifyFollowsWeb;
    if (partial.notifyFollowsEmail !== undefined) payload.notifyFollowsEmail = partial.notifyFollowsEmail;
    if (partial.notifyCommentsWeb !== undefined) payload.notifyCommentsWeb = partial.notifyCommentsWeb;
    if (partial.notifyCommentsEmail !== undefined) payload.notifyCommentsEmail = partial.notifyCommentsEmail;
    if (partial.notifyFactUpdatesWeb !== undefined) payload.notifyFactUpdatesWeb = partial.notifyFactUpdatesWeb;
    if (partial.notifyFactUpdatesEmail !== undefined) payload.notifyFactUpdatesEmail = partial.notifyFactUpdatesEmail;

    const res = await fetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      setUser(mapApiResponse(data));
    } else {
      throw new Error("Failed to update profile");
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isLoading, login, register, updateUser, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
