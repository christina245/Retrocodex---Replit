import { X } from "lucide-react";
import { useEffect } from "react";
import "./HamburgerMenu.css";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="menu-overlay" onClick={onClose} />
      <div className="hamburger-menu">
        <button 
          className="menu-close-button" 
          onClick={onClose}
          data-testid="button-close-menu"
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
        <nav className="menu-nav">
          <a href="#" className="menu-link" data-testid="link-about">
            About
          </a>
          <a href="#" className="menu-link" data-testid="link-blog">
            Blog
          </a>
          <a href="#" className="menu-link" data-testid="link-recommended">
            Recommended reading
          </a>
        </nav>
      </div>
    </>
  );
}
