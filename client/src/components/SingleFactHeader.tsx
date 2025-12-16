import { Search } from "lucide-react";
import { Link } from "wouter";
import logoImage from "@assets/white background logo.png";
import "./SingleFactHeader.css";

interface SingleFactHeaderProps {
  onMenuClick?: () => void;
}

export function SingleFactHeader({ onMenuClick }: SingleFactHeaderProps) {
  return (
    <header className="single-fact-header">
      <div className="single-fact-header-container">
        <div className="header-logo">
          <Link href="/" data-testid="link-home-logo">
            <img 
              src={logoImage} 
              alt="Retrocodex" 
              className="logo-image"
            />
          </Link>
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
