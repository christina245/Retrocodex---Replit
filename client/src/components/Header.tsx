import { useState } from "react";
import { useLocation } from "wouter";
import { Search, HandHeart, X } from "lucide-react";
import instagramLogo from "@assets/Instagram_logo_2016.svg (1)_1763699400163.png";
import blueskyLogo from "@assets/Bluesky_Logo.svg_1763699419379.png";
import redditLogo from "@assets/Reddit-Logo-500x281_1763705445995.png";
import logoImage from "@assets/white background logo 2.png";
import taglineImage from "@assets/tagline only_1763795492353.png";
import taglineMobileImage from "@assets/tagline_mobile_1766215766436.png";
import "./Header.css";

interface HeaderProps {
  onMenuClick?: () => void;
  variant?: "default" | "simplified";
}

export function Header({ onMenuClick, variant = "default" }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };
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
              <a 
                href="https://buymeacoffee.com/retrocodex" 
                target="_blank" 
                rel="noopener noreferrer"
                className="header-donate-button"
                data-testid="button-donate"
                aria-label="Donate to Retrocodex"
              >
                <HandHeart size={16} className="header-donate-icon" />
                Donate
              </a>
            </div>
          </div>
        )}

        <a href="/" className="header-branding" data-testid="link-home-logo">
          <img 
            src={logoImage} 
            alt="Retrocodex" 
            className="logo-image"
          />
        </a>

        <div className="header-actions">
          {isSearchOpen ? (
            <form onSubmit={handleSearchSubmit} className="header-search-form">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search facts..."
                className="header-search-input"
                data-testid="input-search"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                className="header-search-close"
                data-testid="button-search-close"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </form>
          ) : (
            <button 
              className="search-button" 
              data-testid="button-search"
              aria-label="Search facts"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search size={20} />
            </button>
          )}
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
      {variant === "default" && (
        <div className="header-tagline-row">
          <img 
            src={taglineImage} 
            alt="A place to unlearn outdated or untrue lessons in" 
            className="tagline-image tagline-desktop"
          />
          <img 
            src={taglineMobileImage} 
            alt="A place to unlearn outdated or untrue lessons in" 
            className="tagline-image tagline-mobile"
          />
        </div>
      )}
    </header>
  );
}
