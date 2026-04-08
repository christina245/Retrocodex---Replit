import { useState, useEffect } from "react";
import { Search, X, UserRound, Bell, CircleEllipsis } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { Link, useLocation } from "wouter";
import logoImage from "@assets/red black gray logo.png";
import { SignInModal } from "./SignInModal";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import "./SingleFactHeader.css";

interface SingleFactHeaderProps {
  onMenuClick?: () => void;
  onMobileSidebarToggle?: () => void;
}

export function SingleFactHeader({ onMenuClick, onMobileSidebarToggle }: SingleFactHeaderProps) {
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
    <header className="single-fact-header">
      <div className="single-fact-header-container">
        <div className={`header-logo ${isSearchOpen ? 'header-logo-hidden-mobile' : ''}`}>
          <Link href="/" data-testid="link-home-logo">
            <img src={logoImage} alt="Retrocodex" className="logo-image logo-full" />
            <img src="/transparent logo.png" alt="Retrocodex" className="logo-icon-mobile" />
          </Link>
        </div>

        <div className="header-actions">
          {onMobileSidebarToggle && (
            <button
              className="mobile-sidebar-toggle-btn"
              onClick={onMobileSidebarToggle}
              data-testid="button-mobile-sidebar-toggle"
              aria-label="Open navigation"
            >
              <CircleEllipsis size={22} />
            </button>
          )}
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
            href="/submit"
            className="submit-fact-button"
            data-testid="button-submit-fact"
          >
            Submit a Fact
          </a>
          {isLoggedIn ? (
            <button
              className="header-signin-button"
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

      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} onSuccessRedirect="/dashboard" />
    </header>
  );
}
