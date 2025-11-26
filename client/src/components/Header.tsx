import { Search } from "lucide-react";
import instagramLogo from "@assets/Instagram_logo_2016.svg (1)_1763699400163.png";
import blueskyLogo from "@assets/Bluesky_Logo.svg_1763699419379.png";
import redditLogo from "@assets/Reddit-Logo-500x281_1763705445995.png";
import logoImage from "@assets/logo only_1763795492352.png";
import taglineImage from "@assets/tagline only_1763795492353.png";
import donateIcon from "@assets/donate icon_1763804850230.png";
import "./Header.css";

interface HeaderProps {
  onMenuClick?: () => void;
  variant?: "default" | "simplified";
}

export function Header({ onMenuClick, variant = "default" }: HeaderProps) {
  return (
    <header className={`header ${variant === "simplified" ? "header-simplified" : ""}`}>
      <div className="header-container">
        {variant === "default" && (
          <div className="header-left-section">
            <div className="social-icons-column">
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
                <img src={redditLogo} alt="Reddit" className="social-logo social-logo-reddit" />
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
            <a 
              href="https://buymeacoffee.com/retrocodex" 
              target="_blank" 
              rel="noopener noreferrer"
              className="donate-button"
              data-testid="button-donate"
              aria-label="Donate to Retrocodex"
            >
              <img src={donateIcon} alt="" className="donate-icon" />
              <span className="donate-text">Donate</span>
            </a>
          </div>
        )}

        <a href="/" className="header-branding" data-testid="link-home-logo">
          <img 
            src={logoImage} 
            alt="Retrocodex" 
            className="logo-image"
          />
          {variant === "default" && (
            <img 
              src={taglineImage} 
              alt="A place to unlearn outdated or untrue lessons in" 
              className="tagline-image"
            />
          )}
        </a>

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
          {onMenuClick && (
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
          )}
        </div>
      </div>
    </header>
  );
}
