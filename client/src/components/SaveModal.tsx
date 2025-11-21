import { X } from "lucide-react";
import { useState } from "react";
import "./SaveModal.css";

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
}

export function SaveModal({ isOpen, onClose, onSubmit }: SaveModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(email);
      setEmail("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content save-modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="modal-close"
          onClick={onClose}
          data-testid="button-close-save-modal"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="save-modal-illustration">
          <img 
            src="/attached_assets/commenting unavailable in beta_1763696438040.png" 
            alt="Under construction" 
            className="construction-image"
          />
        </div>

        <h2 className="save-modal-title">
          Saving facts is currently unavailable in beta mode. We're working on it!
        </h2>

        <p className="save-modal-description">
          Want to be notified when accounts are available so you can save whatever facts you want? We'll send you an email.
        </p>

        <form onSubmit={handleSubmit} className="save-modal-form">
          <input
            type="email"
            placeholder="youremail@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="save-modal-input"
            data-testid="input-email-save-modal"
            required
          />
          <button 
            type="submit"
            className="save-modal-button"
            disabled={isSubmitting}
            data-testid="button-submit-save-modal"
          >
            {isSubmitting ? "Updating..." : "Update me"}
          </button>
        </form>
      </div>
    </div>
  );
}
