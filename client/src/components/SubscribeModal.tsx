import { X } from "lucide-react";
import { useState } from "react";
import redditLogo from "@assets/Reddit-Logo-500x281_1763705445995.png";
import "./SubscribeModal.css";

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
}

export function SubscribeModal({ isOpen, onClose, onSubmit }: SubscribeModalProps) {
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
      <div className="modal-content subscribe-modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="modal-close"
          onClick={onClose}
          data-testid="button-close-subscribe-modal"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="subscribe-modal-illustration">
          <img 
            src="/attached_assets/under construction_1763805760257.jpg" 
            alt="Under construction" 
            className="construction-image"
          />
        </div>

        <h2 className="subscribe-modal-title">
          Subscribing is currently unavailable in beta mode. We're working on it!
        </h2>

        <p className="subscribe-modal-description">
          If you'd like to be notified when this fact evolves, you'll be able to receive the updates you want after user accounts are enabled. Get on the email waitlist to be notified when that happens!
        </p>

        <form onSubmit={handleSubmit} className="subscribe-modal-form">
          <input
            type="email"
            placeholder="youremail@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="subscribe-modal-input"
            data-testid="input-email-subscribe-modal"
            required
          />
          <button 
            type="submit"
            className="subscribe-modal-button"
            disabled={isSubmitting}
            data-testid="button-submit-subscribe-modal"
          >
            {isSubmitting ? "Updating..." : "Update me"}
          </button>
        </form>

        <div className="subscribe-modal-community">
          <p className="community-text">
            In the meantime, <strong>join the official Reddit community</strong> where community members and Retrocodex admins currently post fact updates while sharing our personal views and experiences:
          </p>
          <div className="community-links">
            <a 
              href="http://reddit.com/r/LearnedWrong" 
              target="_blank" 
              rel="noopener noreferrer"
              className="reddit-icon-link"
              data-testid="link-reddit-icon-subscribe"
              aria-label="Visit Reddit community"
            >
              <img src={redditLogo} alt="Reddit" className="reddit-icon" />
            </a>
            <a 
              href="http://reddit.com/r/LearnedWrong" 
              target="_blank" 
              rel="noopener noreferrer"
              className="visit-community-button"
              data-testid="button-visit-community"
            >
              Visit community
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
