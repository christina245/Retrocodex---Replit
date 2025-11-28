import { X, Check, Copy } from "lucide-react";
import { FaFacebook, FaWhatsapp, FaTelegram, FaFacebookMessenger, FaDiscord } from "react-icons/fa";
import { RiMessengerLine } from "react-icons/ri";
import { BsSendFill } from "react-icons/bs";
import { useState } from "react";
import type { Fact } from "./FactCard";
import smsIcon from "@assets/sms icon_1763805965172.png";
import lineLogo from "@assets/line logo_1763697164032.png";
import "./ShareModal.css";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fact: Fact | null;
}

export function ShareModal({ isOpen, onClose, fact }: ShareModalProps) {
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const handleCopyLink = async () => {
    if (!fact) return;
    
    // In production, this would be the actual fact URL
    const url = `${window.location.origin}/fact/${fact.id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen || !fact) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="modal-close"
          onClick={onClose}
          data-testid="button-close-share-modal"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <h2 className="share-modal-title">Share this fact</h2>

        {/* Share Options */}
        <div className="share-options">
          {/* Active: Copy Link */}
          <button 
            className="share-option active"
            onClick={handleCopyLink}
            data-testid="button-copy-link"
          >
            <Copy size={24} />
            <span>Copy link</span>
          </button>

          {/* Inactive Options with Tooltip */}
          <div className="share-option inactive" data-tooltip="Unavailable in beta">
            <RiMessengerLine size={24} />
            <span>Messenger</span>
          </div>

          <div className="share-option inactive" data-tooltip="Unavailable in beta">
            <FaFacebook size={24} />
            <span>Facebook</span>
          </div>

          <div className="share-option inactive" data-tooltip="Unavailable in beta">
            <FaDiscord size={24} />
            <span>Discord</span>
          </div>

          <div className="share-option inactive" data-tooltip="Unavailable in beta">
            <FaTelegram size={24} />
            <span>Telegram</span>
          </div>

          <div className="share-option inactive" data-tooltip="Unavailable in beta">
            <FaWhatsapp size={24} />
            <span>WhatsApp</span>
          </div>

          <div className="share-option inactive" data-tooltip="Unavailable in beta">
            <BsSendFill size={24} />
            <span>Instagram Direct</span>
          </div>

          <div className="share-option inactive" data-tooltip="Unavailable in beta">
            <img src={smsIcon} alt="" className="share-icon-image" />
            <span>SMS</span>
          </div>
        </div>

        {/* Preview Section */}
        <div className="share-preview-section">
          <div className="share-preview-label">PREVIEW</div>
          <div className="share-preview-card">
            <div className="preview-header">
              <div>
                <h3 className="preview-title">Stuff You Might Have Learned Wrong</h3>
                <p className="preview-subtitle">Learn more about this fact and view sources</p>
              </div>
              <img 
                src={lineLogo} 
                alt="Retrocodex" 
                className="preview-logo"
              />
            </div>

            <div className="preview-fact">
              <div className="preview-fact-section">
                <div className="preview-fact-label">YOU MIGHT HAVE BEEN TAUGHT</div>
                <div className="preview-fact-statement">
                  <X className="preview-fact-icon myth-icon" />
                  <p className="preview-fact-text">"{fact.myth}"</p>
                </div>
              </div>

              <div className="preview-fact-section">
                <div className="preview-fact-label">CURRENT UNDERSTANDING AS OF 2025</div>
                <div className="preview-fact-statement">
                  <Check className="preview-fact-icon truth-icon" />
                  <p className="preview-fact-text">{fact.truth}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copied Toast */}
        {showCopiedToast && (
          <div className="copied-toast" data-testid="toast-copied">
            Copied link to fact
          </div>
        )}
      </div>
    </div>
  );
}
