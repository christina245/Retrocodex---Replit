import { X } from "lucide-react";
import underConstructionImage from "@assets/under construction 2_1764051450148.png";
import redditLogo from "@assets/Reddit-Logo-500x281_1763705445995.png";
import "./VotingModal.css";

interface VotingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VotingModal({ isOpen, onClose }: VotingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content voting-modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="modal-close"
          onClick={onClose}
          data-testid="button-close-voting-modal"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="voting-modal-illustration">
          <img 
            src={underConstructionImage} 
            alt="Under construction" 
            className="construction-image"
          />
        </div>

        <h2 className="voting-modal-title">
          Voting is currently unavailable in beta mode. We're working on it!
        </h2>

        <p className="voting-modal-description">
          If you'd like to share your experiences with this information, head on over to the <strong>official Reddit community "Learned Wrong"</strong> and search for it there!
        </p>

        <div className="voting-modal-action">
          <a 
            href="http://reddit.com/r/LearnedWrong"
            target="_blank"
            rel="noopener noreferrer"
            className="reddit-icon-link"
            data-testid="link-voting-reddit-icon"
          >
            <img src={redditLogo} alt="Reddit" className="reddit-icon" />
          </a>
          <a
            href="http://reddit.com/r/LearnedWrong"
            target="_blank"
            rel="noopener noreferrer"
            className="visit-community-button"
            data-testid="button-voting-visit-community"
          >
            Visit community
          </a>
        </div>
      </div>
    </div>
  );
}
