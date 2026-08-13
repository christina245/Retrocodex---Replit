import { useState, useEffect } from "react";
import { Search, X, UserRound, Bell, CircleEllipsis, MessageCirclePlus } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { Link, useLocation } from "wouter";
import logoImage from "@assets/white transparent logo.png";
import logoIconMobile from "@assets/transparent logo red and white.png";
import { SignInModal } from "./SignInModal";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import "./SingleFactHeaderDark.css";

interface SingleFactHeaderDarkProps {
  onMenuClick?: () => void;
  onMobileSidebarToggle?: () => void;
}

export function SingleFactHeaderDark({ onMenuClick, onMobileSidebarToggle }: SingleFactHeaderDarkProps) {
  const { isLoggedIn, user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [, navigate] = useLocation();
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
    <header className="sfh-dark-header">
      <div className="sfh-dark-header-container">
        <div className={`sfh-dark-header-logo ${isSearchOpen ? 'sfh-dark-header-logo-hidden-mobile' : ''}`}>
          <Link href="/" data-testid="link-home-logo">
            <img src={logoImage} alt="Retrocodex" className="sfh-dark-logo-image sfh-dark-logo-full" />
            <img src={logoIconMobile} alt="Retrocodex" className="sfh-dark-logo-icon-mobile" />
          </Link>
        </div>

        <div className="sfh-dark-header-actions">
          {onMobileSidebarToggle && (
            <button
              className="sfh-dark-mobile-sidebar-toggle-btn"
              onClick={onMobileSidebarToggle}
              data-testid="button-mobile-sidebar-toggle"
              aria-label="Open navigation"
            >
              <CircleEllipsis size={22} />
            </button>
          )}
          {isSearchOpen ? (
            <form onSubmit={handleSearchSubmit} className="sfh-dark-header-search-form">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search facts..."
                className="sfh-dark-header-search-input"
                autoFocus
                data-testid="input-search"
              />
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                className="sfh-dark-search-close-button"
                aria-label="Close search"
                data-testid="button-search-close"
              >
                <X size={20} />
              </button>
            </form>
          ) : (
            <button
              className="sfh-dark-search-button"
              data-testid="button-search"
              aria-label="Search facts"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search size={20} />
            </button>
          )}
          <a
            href="/submit"
            className="sfh-dark-submit-button"
            data-testid="button-submit-fact"
          >
            <MessageCirclePlus size={16} className="sfh-dark-submit-fact-icon" />
            Submit a Fact
          </a>
          {isLoggedIn ? (
            <button
              className="sfh-dark-header-signin-button sfh-dark-header-signin-button--desktop-only"
              onClick={() => navigate("/dashboard")}
              data-testid="button-profile"
              aria-label="Go to profile"
            >
              <UserRound size={16} className="sfh-dark-header-signin-icon" />
              {user?.username || "Profile"}
            </button>
          ) : (
            <button
              className="sfh-dark-header-signin-button"
              onClick={() => setIsSignInOpen(true)}
              data-testid="button-signin"
              aria-label="Sign in"
            >
              <UserRound size={16} className="sfh-dark-header-signin-icon" />
              <span className="sfh-dark-header-signin-text-full">Join the community</span>
              <span className="sfh-dark-header-signin-text-short">Join</span>
            </button>
          )}
          {isLoggedIn && user && (
            <button
              className="sfh-dark-header-mobile-username"
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
              className="sfh-dark-notification-bell-header"
              testId="header-notification-bell"
            />
          )}
          {onMenuClick && (
            <button
              className="sfh-dark-hamburger-button"
              onClick={onMenuClick}
              data-testid="button-menu"
              aria-label="Open menu"
            >
              <div className="sfh-dark-hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          )}
        </div>
      </div>

      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} onSuccessRedirect="/dashboard" />
    </header>
  );
}
