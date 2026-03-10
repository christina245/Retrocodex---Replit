import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, HandHeart, X, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import instagramLogo from "@assets/Instagram_logo_2016.svg (1)_1763699400163.png";
import blueskyLogo from "@assets/Bluesky_Logo.svg_1763699419379.png";
import redditLogo from "@assets/Reddit-Logo-500x281_1763705445995.png";
import logoImage from "@assets/red black gray logo.png";
import taglineImage from "@assets/tagline only lessons 3.png";
import taglineMobileImage from "@assets/tagline_mobile_1766215766436.png";
import { NotificationBell } from "./NotificationBell";
import { SignInModal } from "./SignInModal";
import "./Header.css";

interface HeaderProps {
  onMenuClick?: () => void;
  variant?: "default" | "simplified";
  hideTagline?: boolean;
}

export function Header({ onMenuClick, variant = "default", hideTagline = false }: HeaderProps) {
  const { isLoggedIn, user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [, navigate] = useLocation();
  const notificationCount = 3;

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
    <>
      <header className={`header ${variant === "simplified" ? "header-simplified" : ""}`}>
        <div className="header-container">
          {variant === "default" && (
            <div className="header-left-section">
              <div className="social-icons-column">
                <a 
                  href="https://instagram.com/stuffyoulearnedwrong" 
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
                  aria-label="Support Retrocodex"
                >
                  <HandHeart size={16} className="header-donate-icon" />
                  Donate
                </a>
              </div>
            </div>
          )}

          <Link href="/" className="header-branding" data-testid="link-home-logo">
            <img 
              src={logoImage} 
              alt="Retrocodex" 
              className="logo-image"
            />
          </Link>

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
              href="/submit"
              className="submit-fact-button header-only-submit"
              data-testid="button-submit-fact"
            >
              Submit a Fact
            </a>
            {isLoggedIn ? (
              <button
                className="header-signin-button header-signin-button--desktop-only"
                onClick={() => navigate("/dashboard")}
                data-testid="button-profile"
                aria-label="Go to profile"
              >
                <UserRound size={16} className="header-signin-icon" />
                {user?.username || "Profile"}
              </button>
            ) : (
              <button
                className="header-signin-button"
                onClick={() => setIsSignInOpen(true)}
                data-testid="button-signin"
                aria-label="Sign in"
              >
                <UserRound size={16} className="header-signin-icon" />
                Sign In
              </button>
            )}
            {isLoggedIn && (
              <NotificationBell
                count={notificationCount}
                size={18}
                onClick={() => navigate("/dashboard?tab=notifications")}
                className="notification-bell-header"
                testId="header-notification-bell"
              />
            )}
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
        {variant === "default" && !hideTagline && (
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

      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
      />
    </>
  );
}
