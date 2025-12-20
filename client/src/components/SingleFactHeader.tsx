import { useState } from "react";
import { Search, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import logoImage from "@assets/white background logo.png";
import "./SingleFactHeader.css";

interface SingleFactHeaderProps {
  onMenuClick?: () => void;
}

export function SingleFactHeader({ onMenuClick }: SingleFactHeaderProps) {
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
    <header className="single-fact-header">
      <div className="single-fact-header-container">
        <div className={`header-logo ${isSearchOpen ? 'header-logo-hidden-mobile' : ''}`}>
          <Link href="/" data-testid="link-home-logo">
            <img 
              src={logoImage} 
              alt="Retrocodex" 
              className="logo-image"
            />
          </Link>
        </div>

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
                autoFocus
                data-testid="input-search"
              />
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                className="search-close-button"
                aria-label="Close search"
                data-testid="button-search-close"
              >
                <X size={20} />
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
    </header>
  );
}
