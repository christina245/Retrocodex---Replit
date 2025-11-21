import { Search } from "lucide-react";
import instagramLogo from "@assets/Instagram_logo_2016.svg (1)_1763699400163.png";
import blueskyLogo from "@assets/Bluesky_Logo.svg_1763699419379.png";
import redditLogo from "@assets/Reddit-Logo-500x281_1763705445995.png";
import logoImage from "@assets/logo and tagline bigger_1763702835004.png";
import "./Header.css";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-container">
        {/* Top Row: Social Links, Search, Submit Fact, Hamburger */}
        <div className="header-top-row">
          <div className="header-social">
            <a 
              href="https://instagram.com/retrocodex.facts" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon"
              data-testid="link-instagram"
              aria-label="Visit us on Instagram"
            >
              <img src={instagramLogo} alt="Instagram" className="social-logo" />
            </a>
            <a 
              href="http://reddit.com/r/LearnedWrong" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon"
              data-testid="link-reddit"
              aria-label="Visit us on Reddit"
            >
              <img src={redditLogo} alt="Reddit" className="social-logo" />
            </a>
            <a 
              href="https://bsky.app/profile/the-retrocodex.bsky.social" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon social-icon-bluesky"
              data-testid="link-bluesky"
              aria-label="Visit us on Bluesky"
            >
              <img src={blueskyLogo} alt="Bluesky" className="social-logo social-logo-bluesky" />
            </a>
          </div>
          
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

        {/* Logo & Tagline */}
        <div className="header-branding">
          <img 
            src={logoImage} 
            alt="Retrocodex - A place to unlearn outdated or untrue lessons in" 
            className="logo-tagline-image"
          />
        </div>
      </div>
    </header>
  );
}
