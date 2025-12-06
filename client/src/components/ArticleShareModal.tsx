import { X, Copy } from "lucide-react";
import { FaFacebook, FaWhatsapp, FaTelegram, FaDiscord } from "react-icons/fa";
import { RiMessengerLine } from "react-icons/ri";
import { BsSendFill } from "react-icons/bs";
import { useState } from "react";
import smsIcon from "@assets/sms icon_1763805965172.png";
import "./ArticleShareModal.css";

interface ArticleShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    slug: string;
    title: string;
    summary: string;
    coverImage: string | null;
  } | null;
}

export function ArticleShareModal({ isOpen, onClose, article }: ArticleShareModalProps) {
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const handleCopyLink = async () => {
    if (!article) return;
    
    const url = `${window.location.origin}/articles/${article.slug}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen || !article) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content article-share-modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="modal-close"
          onClick={onClose}
          data-testid="button-close-article-share-modal"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <h2 className="article-share-modal-title">Share this article</h2>

        <div className="article-share-options">
          <button 
            className="article-share-option active"
            onClick={handleCopyLink}
            data-testid="button-copy-article-link"
          >
            <Copy size={24} />
            <span>Copy link</span>
          </button>

          <div className="article-share-option inactive" data-tooltip="Unavailable in beta">
            <RiMessengerLine size={24} />
            <span>Messenger</span>
          </div>

          <div className="article-share-option inactive" data-tooltip="Unavailable in beta">
            <FaFacebook size={24} />
            <span>Facebook</span>
          </div>

          <div className="article-share-option inactive" data-tooltip="Unavailable in beta">
            <FaDiscord size={24} />
            <span>Discord</span>
          </div>

          <div className="article-share-option inactive" data-tooltip="Unavailable in beta">
            <FaTelegram size={24} />
            <span>Telegram</span>
          </div>

          <div className="article-share-option inactive" data-tooltip="Unavailable in beta">
            <FaWhatsapp size={24} />
            <span>WhatsApp</span>
          </div>

          <div className="article-share-option inactive" data-tooltip="Unavailable in beta">
            <BsSendFill size={24} />
            <span>Instagram Direct</span>
          </div>

          <div className="article-share-option inactive" data-tooltip="Unavailable in beta">
            <img src={smsIcon} alt="" className="article-share-icon-image" />
            <span>SMS</span>
          </div>
        </div>

        <div className="article-share-preview-section">
          <div className="article-share-preview-label">PREVIEW</div>
          <div className="article-share-preview-card">
            {article.coverImage && (
              <div className="article-preview-image-container">
                <img 
                  src={article.coverImage} 
                  alt={article.title}
                  className="article-preview-image"
                />
              </div>
            )}
            <div className="article-preview-content">
              <h3 className="article-preview-title">{article.title}</h3>
              <p className="article-preview-summary">{article.summary}</p>
            </div>
          </div>
        </div>

        {showCopiedToast && (
          <div className="article-copied-toast" data-testid="toast-article-copied">
            Copied link to article
          </div>
        )}
      </div>
    </div>
  );
}
