import { useState } from "react";
import { MapPin, Pencil, X, Home } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/lib/auth";
import placeholderPhoto from "@assets/elementor-placeholder-image_1770884094599.png";
import "./UserDashboard.css";

export default function UserDashboard() {
  const { user, isLoggedIn } = useAuth();
  const [, navigate] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [editUsername, setEditUsername] = useState(user?.username || "");
  const [editMisinfo, setEditMisinfo] = useState(user?.misinfoSource || "");

  if (!isLoggedIn || !user) {
    navigate("/");
    return null;
  }
  const MAX_VISIBLE_TAGS = 5;
  const visibleTags = showAllTags
    ? user.favoriteTags
    : user.favoriteTags.slice(0, MAX_VISIBLE_TAGS);
  const hasMoreTags = user.favoriteTags.length > MAX_VISIBLE_TAGS;

  const getTagSlug = (tag: string) => tag.toLowerCase().replace(/\s+/g, "-");

  const handleEditOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setEditModalOpen(false);
  };

  return (
    <div className="user-dashboard" data-testid="user-dashboard">
      <SEO
        title={`${user.username} - Retrocodex`}
        description={`${user.username}'s profile on Retrocodex`}
      />
      <Header onMenuClick={() => setIsMenuOpen(!isMenuOpen)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav />

      <div className="user-dashboard-content">
        <div className="user-profile-banner" data-testid="user-profile-banner">
          <button
            className="user-profile-edit-button"
            onClick={() => setEditModalOpen(true)}
            aria-label="Edit profile"
            data-testid="button-edit-profile"
          >
            <Pencil size={32} />
          </button>

          <div className="user-profile-photo-wrapper">
            <img
              src={user.profilePhoto || placeholderPhoto}
              alt={`${user.username}'s profile photo`}
              className="user-profile-photo"
              data-testid="img-profile-photo"
            />
          </div>

          <div className="user-profile-details" data-testid="user-profile-details">
            <h1 className="user-profile-username" data-testid="text-username">
              {user.username}
            </h1>

            <div className="user-profile-locations" data-testid="user-profile-locations">
              {user.currentLocation ? (
                <span className="user-profile-location-item" data-testid="text-current-location">
                  <MapPin size={14} />
                  {user.currentLocation}
                </span>
              ) : (
                <span className="user-profile-empty" data-testid="text-location-empty">--</span>
              )}
              {user.placesLived.length > 0 && (
                <>
                  {user.placesLived.map((loc, index) => (
                    <span key={loc}>
                      {index > 0 && (
                        <span className="user-profile-location-separator"> • </span>
                      )}
                      <span className="user-profile-location-item" data-testid={`text-place-lived-${index}`}>
                        <Home size={14} />
                        {loc}
                      </span>
                    </span>
                  ))}
                </>
              )}
            </div>

            <div data-testid="user-profile-tags-section">
              <h3 className="user-profile-section-label">FAVORITE SUBJECTS</h3>
              {user.favoriteTags.length > 0 ? (
                <div className="user-profile-tags-row" data-testid="user-profile-tags">
                  {visibleTags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tags/${getTagSlug(tag)}`}
                      className="user-profile-tag-chip"
                      data-testid={`profile-tag-${getTagSlug(tag)}`}
                    >
                      {tag.toLowerCase()}
                    </Link>
                  ))}
                  {hasMoreTags && (
                    <button
                      type="button"
                      className="user-profile-view-more"
                      onClick={() => setShowAllTags(!showAllTags)}
                      data-testid="button-view-more-tags"
                    >
                      {showAllTags ? "Show less" : "+View more"}
                    </button>
                  )}
                </div>
              ) : (
                <span className="user-profile-empty" data-testid="text-tags-empty">--</span>
              )}
            </div>

            <div data-testid="user-profile-misinfo-section">
              <h3 className="user-profile-section-label">
                THE #1 SOURCE OF MISINFORMATION IN MY LIFE IS
              </h3>
              {user.misinfoSource ? (
                <p className="user-profile-misinfo-answer" data-testid="text-misinfo-answer">
                  {user.misinfoSource}
                </p>
              ) : (
                <span className="user-profile-empty" data-testid="text-misinfo-empty">--</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {editModalOpen && (
        <div
          className="edit-profile-overlay"
          onClick={handleEditOverlayClick}
          data-testid="edit-profile-overlay"
        >
          <div className="edit-profile-modal" data-testid="edit-profile-modal">
            <button
              className="edit-profile-close"
              onClick={() => setEditModalOpen(false)}
              aria-label="Close edit profile"
              data-testid="button-close-edit-profile"
            >
              <X size={20} />
            </button>

            <h2 className="edit-profile-title" data-testid="text-edit-title">Edit Profile</h2>

            <div className="edit-profile-section">
              <label className="edit-profile-label">PROFILE PHOTO</label>
              <div className="edit-profile-photo-section">
                <img
                  src={user.profilePhoto || placeholderPhoto}
                  alt="Profile preview"
                  className="edit-profile-photo-preview"
                  data-testid="img-edit-photo-preview"
                />
                <button
                  type="button"
                  className="edit-profile-photo-upload"
                  data-testid="button-upload-photo"
                >
                  Upload Photo
                </button>
              </div>
            </div>

            <div className="edit-profile-section">
              <label className="edit-profile-label">USERNAME</label>
              <input
                type="text"
                className="edit-profile-input"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                data-testid="input-edit-username"
              />
            </div>

            <div className="edit-profile-section">
              <label className="edit-profile-label">
                THE #1 SOURCE OF MISINFORMATION IN MY LIFE IS
              </label>
              <textarea
                className="edit-profile-textarea"
                value={editMisinfo}
                onChange={(e) => {
                  if (e.target.value.length <= 200) setEditMisinfo(e.target.value);
                }}
                maxLength={200}
                placeholder="Type your answer here..."
                data-testid="input-edit-misinfo"
              />
              <div className="edit-profile-char-count" data-testid="text-char-count">
                {editMisinfo.length}/200
              </div>
            </div>

            <button
              type="button"
              className="edit-profile-save"
              data-testid="button-save-profile"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
