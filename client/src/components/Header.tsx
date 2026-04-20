import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Search, HandHeart, X, UserRound, MessageCirclePlus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
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
  const headerRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const searchBtnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const header = headerRef.current;
    const actions = actionsRef.current;
    const searchBtn = searchBtnRef.current;
    if (!header || !actions || !searchBtn) return;
    const updateClusterWidth = () => {
      const actionsRect = actions.getBoundingClientRect();
      const btnRect = searchBtn.getBoundingClientRect();
      const reserve = Math.max(0, actionsRect.right - btnRect.right);
      header.style.setProperty("--header-right-reserve", `${Math.ceil(reserve)}px`);
    };
    updateClusterWidth();
    const ro = new ResizeObserver(updateClusterWidth);
    ro.observe(actions);
    window.addEventListener("resize", updateClusterWidth);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateClusterWidth);
    };
  }, [isLoggedIn]);
  const [since, setSince] = useState(() => {
    try {
      return localStorage.getItem("activityLastSeenAt") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    } catch {
      return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  });
  useEffect(() => {
    const sync = () => {
      try {
        const stored = localStorage.getItem("activityLastSeenAt");
        if (stored) setSince(stored);
      } catch {}
    };
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);
  const { data: notifCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/count", since],
    queryFn: () => fetch(`/api/notifications/count?since=${encodeURIComponent(since)}`, { credentials: "include" }).then(r => r.json()),
    enabled: isLoggedIn,
    staleTime: 60_000,
    refetchInterval: 90_000,
  });
  const notificationCount = notifCountData?.count ?? 0;

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
      <header ref={headerRef} className={`header ${variant === "simplified" ? "header-simplified" : ""}`}>
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
            <img src={logoImage} alt="Retrocodex" className="logo-image logo-full" />
            <img src="/transparent logo.png" alt="Retrocodex" className="logo-icon-mobile" />
          </Link>

          <div ref={actionsRef} className="header-actions">
            <button 
              ref={searchBtnRef}
              className={`search-button ${isSearchOpen ? "search-button-hidden" : ""}`}
              data-testid="button-search"
              aria-label="Search facts"
              onClick={() => setIsSearchOpen(true)}
              tabIndex={isSearchOpen ? -1 : 0}
              aria-hidden={isSearchOpen}
            >
              <Search size={20} />
            </button>
            {isSearchOpen && (
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
            )}
            <a 
              href="/submit"
              className="submit-fact-button header-only-submit"
              data-testid="button-submit-fact"
            >
              <MessageCirclePlus size={16} className="submit-fact-icon" />
              Submit a Fact
            </a>
            {isLoggedIn ? (
              <button
                className="header-signin-button header-main-signin header-signin-button--desktop-only"
                onClick={() => navigate("/dashboard")}
                data-testid="button-profile"
                aria-label="Go to profile"
              >
                <UserRound size={16} className="header-signin-icon" />
                {user?.username || "Profile"}
              </button>
            ) : (
              <button
                className="header-signin-button header-main-signin"
                onClick={() => setIsSignInOpen(true)}
                data-testid="button-signin"
                aria-label="Sign in"
              >
                <UserRound size={16} className="header-signin-icon" />
                Sign In
              </button>
            )}
            {isLoggedIn && user && (
              <button
                className="header-mobile-username"
                onClick={() => navigate("/dashboard")}
                data-testid="button-profile-mobile"
                aria-label="Go to profile"
              >
                {(user.username || "").length > 10
                  ? (user.username || "").slice(0, 10) + "…"
                  : (user.username || "")}
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
        onSuccessRedirect="/dashboard"
      />
    </>
  );
}
