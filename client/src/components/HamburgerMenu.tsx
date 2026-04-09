import { X } from "lucide-react";
import { useEffect } from "react";
import instagramLogo from "@assets/Instagram_logo_2016.svg (1)_1763699400163.png";
import blueskyLogo from "@assets/Bluesky_Logo.svg_1763699419379.png";
import redditLogo from "@assets/Reddit-Logo-500x281_1763705445995.png";
import donateIcon from "@assets/donate icon_1763804850230.png";
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
          <a href="/about" className="menu-link" data-testid="link-about">
            About
          </a>
          <a href="/recommended-reading" className="menu-link" data-testid="link-recommended-reading">
            Recommended reading
          </a>
          <a href="/articles" className="menu-link" data-testid="link-blog">
            Articles
          </a>
      
        </nav>

        <div className="menu-mobile-actions">
          <a 
            href="https://form.typeform.com/to/pal6ZbpG" 
            target="_blank" 
            rel="noopener noreferrer"
            className="menu-submit-button"
            data-testid="menu-button-submit-fact"
          >
            Submit a Fact
          </a>
          <a 
            href="https://buymeacoffee.com/retrocodex" 
            target="_blank" 
            rel="noopener noreferrer"
            className="menu-donate-button"
            data-testid="menu-button-donate"
          >
            <img src={donateIcon} alt="" className="menu-donate-icon" />
            <span>Donate</span>
          </a>

          <div className="menu-social-links">
            <a 
              href="https://instagram.com/retrocodex.facts" 
              target="_blank" 
              rel="noopener noreferrer"
              className="menu-social-icon"
              data-testid="menu-link-instagram"
              aria-label="Visit us on Instagram"
            >
              <img src={instagramLogo} alt="Instagram" className="menu-social-logo" />
            </a>
            <a 
              href="http://reddit.com/r/LearnedWrong" 
              target="_blank" 
              rel="noopener noreferrer"
              className="menu-social-icon"
              data-testid="menu-link-reddit"
              aria-label="Visit us on Reddit"
            >
              <img src={redditLogo} alt="Reddit" className="menu-social-logo menu-social-logo-reddit" />
            </a>
            <a 
              href="https://bsky.app/profile/the-retrocodex.bsky.social" 
              target="_blank" 
              rel="noopener noreferrer"
              className="menu-social-icon"
              data-testid="menu-link-bluesky"
              aria-label="Visit us on Bluesky"
            >
              <img src={blueskyLogo} alt="Bluesky" className="menu-social-logo menu-social-logo-bluesky" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
