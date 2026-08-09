import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Search, HandHeart, X, UserRound, MessageCirclePlus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import instagramLogo from "@assets/Instagram_logo_2016.svg (1)_1763699400163.png";
import blueskyLogo from "@assets/Bluesky_Logo.svg_1763699419379.png";
import redditLogo from "@assets/Reddit-Logo-500x281_1763705445995.png";
import logoImage from "@assets/white transparent logo.png";
import taglineImage from "@assets/tagline only lessons 3.png";
import taglineMobileImage from "@assets/tagline_mobile_1766215766436.png";
import { NotificationBell } from "./NotificationBell";
import { SignInModal } from "./SignInModal";
import "./HeaderDark.css";

interface HeaderDarkProps {
  onMenuClick?: () => void;
  variant?: "default" | "simplified";
  hideTagline?: boolean;
}

export function HeaderDark({ onMenuClick, variant = "default", hideTagline = false }: HeaderDarkProps) {
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
      <header ref={headerRef} className={`dark-header ${variant === "simplified" ? "dark-header-simplified" : ""}`}>
        <div className="dark-header-container">
          {variant === "default" && (
            <div className="dark-header-left-section">
              <div className="dark-social-icons-column">

                <a
                  href="https://buymeacoffee.com/retrocodex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dark-header-donate-button"
                  data-testid="button-donate"
                  aria-label="Help fund Retrocodex"
                >
                  <HandHeart size={16} className="dark-header-donate-icon" />
                  Help fund
                </a>
              </div>
            </div>
          )}

          <Link href="/" className="dark-header-branding" data-testid="link-home-logo">
            <img src={logoImage} alt="Retrocodex" className="dark-logo-image dark-logo-full" />
            <img src="/transparent logo.png" alt="Retrocodex" className="dark-logo-icon-mobile" />
          </Link>

          <div ref={actionsRef} className="dark-header-actions">
            <button
              ref={searchBtnRef}
              className={`dark-search-button ${isSearchOpen ? "dark-search-button-hidden" : ""}`}
              data-testid="button-search"
              aria-label="Search facts"
              onClick={() => setIsSearchOpen(true)}
              tabIndex={isSearchOpen ? -1 : 0}
              aria-hidden={isSearchOpen}
            >
              <Search size={20} />
            </button>
            {isSearchOpen && (
              <form onSubmit={handleSearchSubmit} className="dark-header-search-form">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search facts..."
                  className="dark-header-search-input"
                  data-testid="input-search"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="dark-header-search-close"
                  data-testid="button-search-close"
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>
              </form>
            )}
            <a
              href="/submit"
              className="dark-submit-fact-button dark-header-only-submit"
              data-testid="button-submit-fact"
            >
              <MessageCirclePlus size={16} className="dark-submit-fact-icon" />
              Submit a Fact
            </a>
            {isLoggedIn ? (
              <button
                className="dark-header-signin-button dark-header-main-signin dark-header-signin-button--desktop-only"
                onClick={() => navigate("/dashboard")}
                data-testid="button-profile"
                aria-label="Go to profile"
              >
                <UserRound size={16} className="dark-header-signin-icon" />
                {user?.username || "Profile"}
              </button>
            ) : (
              <button
                className="dark-header-signin-button dark-header-main-signin"
                onClick={() => setIsSignInOpen(true)}
                data-testid="button-signin"
                aria-label="Sign in"
              >
                <UserRound size={16} className="dark-header-signin-icon" />
                <span className="dark-header-signin-text-full">Join the community</span>
                <span className="dark-header-signin-text-short">Join</span>
              </button>
            )}
            {isLoggedIn && user && (
              <button
                className="dark-header-mobile-username"
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
                className="dark-notification-bell-header"
                testId="header-notification-bell"
              />
            )}
            {onMenuClick && (
              <button
                className="dark-hamburger-button"
                onClick={onMenuClick}
                data-testid="button-menu"
                aria-label="Open menu"
              >
                <div className="dark-hamburger-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </button>
            )}
          </div>
        </div>
        {variant === "default" && !hideTagline && (
          <div className="dark-header-tagline-row">
            <img
              src={taglineImage}
              alt="A place to unlearn outdated or untrue lessons in"
              className="dark-tagline-image dark-tagline-desktop"
            />
            <img
              src={taglineMobileImage}
              alt="A place to unlearn outdated or untrue lessons in"
              className="dark-tagline-image dark-tagline-mobile"
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
