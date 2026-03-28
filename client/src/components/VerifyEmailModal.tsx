import { useState } from "react";
import { MailCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface VerifyEmailModalProps {
  onClose: () => void;
}

export function VerifyEmailModal({ onClose }: VerifyEmailModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleResend() {
    setIsSending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setSent(true);
        toast({ title: "Email sent!", description: "Check your inbox for the verification link." });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" data-testid="verify-email-modal">
      <div className="bg-background rounded-md border border-border shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover-elevate rounded-md p-1"
          data-testid="button-close-verify-modal"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center gap-4 pt-2">
          <div className="rounded-full bg-muted p-3">
            <MailCheck className="w-7 h-7 text-muted-foreground" />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-1">Please verify your email first</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We sent a verification link to{" "}
              <span className="font-medium text-foreground">{user?.email}</span>.
              Click the link in that email to unlock this feature.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full">
            {sent ? (
              <p className="text-sm text-muted-foreground">
                A new link has been sent — check your inbox (and your spam folder, just in case).
              </p>
            ) : (
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={isSending}
                data-testid="button-resend-verification"
                className="w-full"
              >
                {isSending ? "Sending…" : "Resend verification email"}
              </Button>
            )}
            <Button variant="ghost" onClick={onClose} className="w-full" data-testid="button-dismiss-verify-modal">
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
