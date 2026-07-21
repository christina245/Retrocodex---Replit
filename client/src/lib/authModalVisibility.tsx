import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface AuthModalVisibilityContextType {
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
}

const AuthModalVisibilityContext = createContext<AuthModalVisibilityContextType>({
  isAuthModalOpen: false,
  setAuthModalOpen: () => {},
});

export function AuthModalVisibilityProvider({ children }: { children: ReactNode }) {
  const [openCount, setOpenCount] = useState(0);

  const setAuthModalOpen = useCallback((open: boolean) => {
    setOpenCount((count) => Math.max(0, count + (open ? 1 : -1)));
  }, []);

  return (
    <AuthModalVisibilityContext.Provider value={{ isAuthModalOpen: openCount > 0, setAuthModalOpen }}>
      {children}
    </AuthModalVisibilityContext.Provider>
  );
}

export function useAuthModalVisibility() {
  return useContext(AuthModalVisibilityContext);
}
