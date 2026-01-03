import { useEffect } from "react";
import { X } from "lucide-react";
import "./Lightbox.css";

interface LightboxProps {
  src: string;
  alt: string;
  caption?: string;
  onClose: () => void;
}

export default function Lightbox({ src, alt, caption, onClose }: LightboxProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div 
      className="lightbox-overlay" 
      onClick={onClose}
      data-testid="lightbox-overlay"
    >
      <button 
        className="lightbox-close-button"
        onClick={onClose}
        aria-label="Close lightbox"
        data-testid="button-lightbox-close"
      >
        <X size={20} />
      </button>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img 
          src={src} 
          alt={alt} 
          className="lightbox-image"
          data-testid="lightbox-image"
        />
        {caption && (
          <div className="lightbox-caption" data-testid="lightbox-caption">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
}
