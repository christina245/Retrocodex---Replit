import { Search } from "lucide-react";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import { FaXTwitter, FaBluesky } from "react-icons/fa6";
import "./Header.css";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-container">
        {/* Social Links */}
        <div className="header-social">
          <a 
            href="https://instagram.com/retrocodex.facts" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-icon"
            data-testid="link-instagram"
            aria-label="Visit us on Instagram"
          >
            <FaInstagram />
          </a>
          <a 
            href="https://bsky.app/profile/the-retrocodex.bsky.social" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-icon"
            data-testid="link-bluesky"
            aria-label="Visit us on Bluesky"
          >
            <FaBluesky />
          </a>
          <a 
            href="https://x.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-icon"
            data-testid="link-twitter"
            aria-label="Visit us on X (Twitter)"
          >
            <FaXTwitter />
          </a>
        </div>

        {/* Donate Button */}
        <a 
          href="https://buymeacoffee.com/retrocodex" 
          target="_blank" 
          rel="noopener noreferrer"
          className="donate-button"
          data-testid="button-donate"
        >
          Donate
        </a>

        {/* Logo & Tagline */}
        <div className="header-branding">
          <div className="logo">
            <img 
              src="/attached_assets/line logo_1763697164032.png" 
              alt="Retrocodex Logo" 
              className="logo-image"
            />
            <span className="logo-text">Retrocodex</span>
          </div>
          <p className="tagline">A place to unlearn outdated or untrue beliefs ✓</p>
        </div>

        {/* Search & Actions */}
        <div className="header-actions">
          <button 
            className="search-button" 
            data-testid="button-search"
            aria-label="Search facts"
            disabled
            title="Search coming soon"
          >
            <Search size={20} />
          </button>
          <a 
            href="https://form.typeform.com/to/pal6ZbpG" 
            target="_blank" 
            rel="noopener noreferrer"
            className="submit-fact-button"
            data-testid="button-submit-fact"
          >
            Submit a Fact
          </a>
          <button 
            className="hamburger-button" 
            onClick={onMenuClick}
            data-testid="button-menu"
            aria-label="Open menu"
          >
            <div className="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
