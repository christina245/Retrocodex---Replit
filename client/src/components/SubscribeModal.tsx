import { X } from "lucide-react";
import { useEffect } from "react";
import "./SubscribeModal.css";

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (email: string) => Promise<void>;
}

export function SubscribeModal({ isOpen, onClose }: SubscribeModalProps) {
  useEffect(() => {
    if (isOpen) {
      const script = document.createElement("script");
      script.src = "https://subscribe-forms.beehiiv.com/embed.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content subscribe-modal beehiiv-modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="modal-close"
          onClick={onClose}
          data-testid="button-close-subscribe-modal"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="beehiiv-embed-container">
          <iframe 
            src="https://subscribe-forms.beehiiv.com/56dceb78-1e7f-4515-be77-7f81baf1acfb" 
            className="beehiiv-embed" 
            data-testid="beehiiv-embed"
            frameBorder="0" 
            scrolling="no" 
            style={{
              width: "400px",
              height: "353px",
              margin: 0,
              borderRadius: "0px",
              backgroundColor: "transparent",
              boxShadow: "none",
              maxWidth: "100%"
            }}
            title="Subscribe to newsletter"
          />
        </div>
      </div>
    </div>
  );
}
