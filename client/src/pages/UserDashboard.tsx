import { useState, useRef, useEffect } from "react";
import { MapPin, Pencil, X, Home, Plus, Minus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/lib/auth";
import placeholderPhoto from "@assets/elementor-placeholder-image_1770884094599.png";
import "./UserDashboard.css";

const SAMPLE_COUNTRIES = [
  "Australia", "Brazil", "Canada", "France", "Germany",
  "India", "Japan", "Mexico", "Nigeria", "United Kingdom", "United States",
];

const SAMPLE_US_STATES = [
  "California", "Florida", "Georgia", "Illinois", "Massachusetts",
  "New York", "Ohio", "Pennsylvania", "Texas", "Washington",
];

interface LocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  testId: string;
  icon: "pin" | "home";
}

function LocationSelect({ value, onChange, placeholder = "Search country...", testId, icon }: LocationSelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = SAMPLE_COUNTRIES.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = isOpen ? query : value;

  return (
    <div className="signin-country-select-container" ref={containerRef}>
      <div className="signin-country-input-wrapper">
        <span className="signin-country-icon">
          {icon === "pin" ? <MapPin size={18} /> : <Home size={18} />}
        </span>
        <input
          type="text"
          className="signin-input"
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setQuery("");
          }}
          placeholder={placeholder}
          data-testid={testId}
        />
      </div>
      {isOpen && (
        <div className="signin-country-dropdown" data-testid={`${testId}-dropdown`}>
          {filtered.length > 0 ? (
            filtered.map((country) => (
              <div
                key={country}
                className={`signin-country-option${value === country ? " signin-country-option-selected" : ""}`}
                onClick={() => {
                  onChange(country);
                  setQuery("");
                  setIsOpen(false);
                }}
                data-testid={`${testId}-option-${country.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {country}
              </div>
            ))
          ) : (
            <div className="signin-country-option" style={{ color: "#999", cursor: "default" }}>
              No results
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StateSelect({ value, onChange, testId }: { value: string; onChange: (v: string) => void; testId: string }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = SAMPLE_US_STATES.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = isOpen ? query : value;

  return (
    <div className="signin-country-select-container signin-state-field" ref={containerRef}>
      <div className="signin-country-input-wrapper">
        <span className="signin-country-icon">
          <MapPin size={18} />
        </span>
        <input
          type="text"
          className="signin-input"
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setQuery("");
          }}
          placeholder="Search state..."
          data-testid={testId}
        />
      </div>
      {isOpen && (
        <div className="signin-country-dropdown" data-testid={`${testId}-dropdown`}>
          {filtered.length > 0 ? (
            filtered.map((state) => (
              <div
                key={state}
                className={`signin-country-option${value === state ? " signin-country-option-selected" : ""}`}
                onClick={() => {
                  onChange(state);
                  setQuery("");
                  setIsOpen(false);
                }}
                data-testid={`${testId}-option-${state.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {state}
              </div>
            ))
          ) : (
            <div className="signin-country-option" style={{ color: "#999", cursor: "default" }}>
              No results
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function UserDashboard() {
  const { user, isLoggedIn } = useAuth();
  const [, navigate] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showAllPlaces, setShowAllPlaces] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const parseLocation = (loc: string) => {
    const parts = loc.split(", ");
    if (parts.length === 2 && SAMPLE_COUNTRIES.includes(parts[1])) {
      return { country: parts[1], usState: parts[1] === "United States" ? parts[0] : "" };
    }
    if (SAMPLE_COUNTRIES.includes(loc)) {
      return { country: loc, usState: "" };
    }
    return { country: loc, usState: "" };
  };

  const parsedCurrent = user ? parseLocation(user.currentLocation) : { country: "", usState: "" };

  const [editUsername, setEditUsername] = useState(user?.username || "");
  const [editMisinfo, setEditMisinfo] = useState(user?.misinfoSource || "");
  const [editCurrentCountry, setEditCurrentCountry] = useState(parsedCurrent.country);
  const [editCurrentState, setEditCurrentState] = useState(parsedCurrent.usState);
  const [editShowCurrentLocation, setEditShowCurrentLocation] = useState(user?.showCurrentLocation || false);
  const [editPlacesLived, setEditPlacesLived] = useState<{ country: string; usState: string }[]>(
    user?.placesLived.map((p) => parseLocation(p)) || [{ country: "", usState: "" }]
  );
  const [editShowPlacesLived, setEditShowPlacesLived] = useState(user?.showPlacesLived || false);

  if (!isLoggedIn || !user) {
    navigate("/");
    return null;
  }
  const MAX_VISIBLE_TAGS = 5;
  const MAX_VISIBLE_PLACES = 2;
  const visibleTags = showAllTags
    ? user.favoriteTags
    : user.favoriteTags.slice(0, MAX_VISIBLE_TAGS);
  const hasMoreTags = user.favoriteTags.length > MAX_VISIBLE_TAGS;
  const visiblePlaces = showAllPlaces
    ? user.placesLived
    : user.placesLived.slice(0, MAX_VISIBLE_PLACES);
  const hasMorePlaces = user.placesLived.length > MAX_VISIBLE_PLACES;

  const getTagSlug = (tag: string) => tag.toLowerCase().replace(/\s+/g, "-");

  const handleEditOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setEditModalOpen(false);
  };

  const handlePlaceLivedChange = (index: number, country: string) => {
    const updated = [...editPlacesLived];
    updated[index] = { country, usState: country !== "United States" ? "" : updated[index].usState };
    setEditPlacesLived(updated);
  };

  const handlePlaceLivedStateChange = (index: number, usState: string) => {
    const updated = [...editPlacesLived];
    updated[index] = { ...updated[index], usState };
    setEditPlacesLived(updated);
  };

  const handleAddPlaceLived = () => {
    if (editPlacesLived.length < 5) {
      setEditPlacesLived([...editPlacesLived, { country: "", usState: "" }]);
    }
  };

  const handleRemovePlaceLived = (index: number) => {
    if (editPlacesLived.length > 1) {
      setEditPlacesLived(editPlacesLived.filter((_, i) => i !== index));
    }
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

            <div className="user-profile-locations-wrapper" data-testid="user-profile-locations">
              <div className="user-profile-current-location">
                {user.currentLocation ? (
                  <span className="user-profile-location-item" data-testid="text-current-location">
                    <MapPin size={14} />
                    {user.currentLocation}
                  </span>
                ) : (
                  <span className="user-profile-empty" data-testid="text-location-empty">--</span>
                )}
              </div>
              {user.placesLived.length > 0 && (
                <div className="user-profile-places-lived">
                  <Home size={14} className="user-profile-places-icon" />
                  {visiblePlaces.map((loc, index) => (
                    <span key={loc}>
                      {index > 0 && (
                        <span className="user-profile-location-separator">  •  </span>
                      )}
                      <span className="user-profile-place-item" data-testid={`text-place-lived-${index}`}>
                        {loc}
                      </span>
                    </span>
                  ))}
                  {hasMorePlaces && (
                    <button
                      type="button"
                      className="user-profile-view-more"
                      onClick={() => setShowAllPlaces(!showAllPlaces)}
                      data-testid="button-view-more-places"
                    >
                      {showAllPlaces ? "Show less" : "+View more"}
                    </button>
                  )}
                </div>
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
                className="edit-profile-input edit-profile-input-half"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                data-testid="input-edit-username"
              />
            </div>

            <div className="edit-profile-section">
              <label className="edit-profile-label">CURRENT AND PAST LOCATIONS</label>
              <div className="edit-profile-locations-columns" data-testid="edit-locations-section">
                <div className="edit-profile-location-column" data-testid="edit-current-location-column">
                  <span className="edit-profile-location-column-label">CURRENT LOCATION</span>
                  <LocationSelect
                    value={editCurrentCountry}
                    onChange={(val) => {
                      setEditCurrentCountry(val);
                      if (val !== "United States") setEditCurrentState("");
                    }}
                    testId="input-edit-current-country"
                    icon="pin"
                  />
                  {editCurrentCountry === "United States" && (
                    <StateSelect
                      value={editCurrentState}
                      onChange={setEditCurrentState}
                      testId="input-edit-current-state"
                    />
                  )}
                  <div className="edit-profile-checkbox-row" data-testid="checkbox-show-current-location">
                    <input
                      type="checkbox"
                      id="show-current-location"
                      checked={editShowCurrentLocation}
                      onChange={(e) => setEditShowCurrentLocation(e.target.checked)}
                    />
                    <label htmlFor="show-current-location">Display on my profile</label>
                  </div>
                </div>

                <div className="edit-profile-location-column" data-testid="edit-places-lived-column">
                  <span className="edit-profile-location-column-label">PLACES I'VE LIVED</span>
                  {editPlacesLived.map((entry, index) => (
                    <div key={index}>
                      <div className="edit-profile-place-row">
                        <LocationSelect
                          value={entry.country}
                          onChange={(val) => handlePlaceLivedChange(index, val)}
                          placeholder="Search country..."
                          testId={`input-edit-place-lived-${index}`}
                          icon="home"
                        />
                        {index === editPlacesLived.length - 1 && editPlacesLived.length < 5 && (
                          <button
                            type="button"
                            className="signin-add-remove-btn"
                            onClick={handleAddPlaceLived}
                            data-testid="button-add-place-lived"
                            aria-label="Add another place"
                          >
                            <Plus size={18} />
                          </button>
                        )}
                        {editPlacesLived.length > 1 && (
                          <button
                            type="button"
                            className="signin-add-remove-btn"
                            onClick={() => handleRemovePlaceLived(index)}
                            data-testid={`button-remove-place-lived-${index}`}
                            aria-label="Remove place"
                          >
                            <Minus size={18} />
                          </button>
                        )}
                      </div>
                      {entry.country === "United States" && (
                        <StateSelect
                          value={entry.usState}
                          onChange={(val) => handlePlaceLivedStateChange(index, val)}
                          testId={`input-edit-place-lived-state-${index}`}
                        />
                      )}
                    </div>
                  ))}
                  <div className="edit-profile-checkbox-row" data-testid="checkbox-show-places-lived">
                    <input
                      type="checkbox"
                      id="show-places-lived"
                      checked={editShowPlacesLived}
                      onChange={(e) => setEditShowPlacesLived(e.target.checked)}
                    />
                    <label htmlFor="show-places-lived">Display on my profile</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="edit-profile-section">
              <label className="edit-profile-label">
                THE #1 SOURCE OF MISINFORMATION IN MY LIFE IS
              </label>
              <textarea
                className="edit-profile-textarea edit-profile-input-half"
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
