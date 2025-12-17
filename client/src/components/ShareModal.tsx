import { X, Copy } from "lucide-react";
import { FaFacebook, FaWhatsapp, FaTelegram, FaDiscord } from "react-icons/fa";
import { RiMessengerLine } from "react-icons/ri";
import { BsSendFill } from "react-icons/bs";
import { useState } from "react";
import type { Fact } from "./FactCard";
import smsIcon from "@assets/sms icon_1763805965172.png";
import "./ShareModal.css";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fact: Fact | null;
}

// Map category display names to URL paths
function getCategoryUrl(category: string): string {
  // Normalize to uppercase and trim for consistent matching
  const normalizedCategory = category.toUpperCase().trim();
  
  const categoryMap: Record<string, string> = {
    // Main categories
    "HISTORY": "/category/history",
    "LIFE SCIENCES": "/category/life-sciences",
    "EVERYDAY LIFE": "/category/everyday-life",
    "HEALTH & FITNESS": "/category/health-fitness",
    "SOCIAL SCIENCES": "/category/social-sciences",
    "GENDER & SEXUALITY": "/category/gender-sexuality",
    "OTHER": "/category/other",
    
    // Subcategories with "OTHER:" prefix
    "OTHER: ANIMALS": "/category/other/animals",
    "OTHER: ASTRONOMY": "/category/other/astronomy",
    "OTHER: BEAUTY": "/category/other/beauty",
    "OTHER: EARTH SCIENCE": "/category/other/earth-science",
    "OTHER: FOOD": "/category/other/food",
    "OTHER: LINGUISTICS": "/category/other/linguistics",
    "OTHER: MUSIC": "/category/other/music",
    "OTHER: PHYSICS": "/category/other/physics",
    "OTHER: TECHNOLOGY": "/category/other/technology",
    "OTHER: UNCATEGORIZED": "/category/other/uncategorized",
    
    // Standalone subcategory names (without prefix)
    "ANIMALS": "/category/other/animals",
    "ASTRONOMY": "/category/other/astronomy",
    "BEAUTY": "/category/other/beauty",
    "EARTH SCIENCE": "/category/other/earth-science",
    "FOOD": "/category/other/food",
    "LINGUISTICS": "/category/other/linguistics",
    "MUSIC": "/category/other/music",
    "PHYSICS": "/category/other/physics",
    "TECHNOLOGY": "/category/other/technology",
    "UNCATEGORIZED": "/category/other/uncategorized",
  };
  
  return categoryMap[normalizedCategory] || "/";
}

export function ShareModal({ isOpen, onClose, fact }: ShareModalProps) {
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const handleCopyLink = async () => {
    if (!fact) return;
    
    // If fact has a dedicated page (link property), use that URL
    // Otherwise, use the category page URL as fallback
    const url = fact.link 
      ? `${window.location.origin}${fact.link}`
      : `${window.location.origin}${getCategoryUrl(fact.category)}`;
    
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
