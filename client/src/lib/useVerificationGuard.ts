import { useState } from "react";
import { useAuth } from "@/lib/auth";

export function useVerificationGuard() {
  const { user } = useAuth();
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  function requireVerified(action: () => void): void {
    if (!user) return;
    if (!user.emailVerified) {
      setShowVerifyModal(true);
      return;
    }
    action();
  }

  function isVerified(): boolean {
    return !!user?.emailVerified;
  }

  return {
    showVerifyModal,
    setShowVerifyModal,
    requireVerified,
    isVerified,
  };
}
