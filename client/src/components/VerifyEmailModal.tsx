import { useState } from "react";
import { X, RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import envelopeImage from "@assets/email_1774815930235.png";
import "./SignInModal.css";

interface VerifyEmailModalProps {
  onClose: () => void;
}

export function VerifyEmailModal({ onClose }: VerifyEmailModalProps) {
  const { user, refetchUser } = useAuth();

  async function handleClose() {
    await refetchUser();
    onClose();
  }
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  async function handleResend() {
    if (isSending || resendCooldown > 0) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setSent(true);
        setResendCooldown(60);
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) { clearInterval(interval); return 0; }
            return prev - 1;
          });
        }, 1000);
        toast({ title: "Email sent!", description: "Check your inbox for the verification link." });
      } else if (res.status === 429) {
        toast({ title: "Too many attempts", description: "Please wait before requesting another email.", variant: "destructive" });
      } else {
        const data = await res.json().catch(() => ({}));
        toast({ title: "Could not send email", description: data.message || "Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Please check your connection and try again.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="signin-overlay" data-testid="verify-email-modal">
      <div className="signin-modal" data-testid="verify-email-modal-inner">
        <button
          onClick={handleClose}
          className="signin-close"
          data-testid="button-close-verify-modal"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="signin-modal-body">
          <div className="signin-email-verification">
            <img
              src={envelopeImage}
              alt="Verify your email"
              className="signin-verify-envelope"
              data-testid="img-verify-envelope"
            />
            <h2 className="signin-confirmation-title signin-verify-title" data-testid="text-verify-heading">
              Please verify your email first
            </h2>
            <p className="signin-verify-body" data-testid="text-verify-body">
              We sent a verification link to{" "}
              <span className="signin-verify-email">{user?.email}</span>.
              Click the link in that email to unlock this feature.
            </p>

            {sent && resendCooldown === 0 ? (
              <p className="signin-verify-feedback" data-testid="text-resend-sent">
                A new link has been sent — check your inbox (and your spam folder, just in case).
              </p>
            ) : (
              <button
                type="button"
                className="signin-resend-button"
                data-testid="button-resend-verification"
                onClick={handleResend}
                disabled={isSending || resendCooldown > 0}
              >
                <RotateCcw size={15} className="signin-resend-icon" />
                {isSending
                  ? "Sending…"
                  : resendCooldown > 0
                  ? `Resend email in ${resendCooldown}s`
                  : "Resend verification email"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
