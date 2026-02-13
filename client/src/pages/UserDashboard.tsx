import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { MapPin, Pencil, X, Home, Plus, Minus, XCircle, Search, Bookmark, Users, MapPinned, BellRing, FileText, MessageSquare, FilePenLine, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SingleFactHeader } from "@/components/SingleFactHeader";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { FactCard } from "@/components/FactCard";
import type { Fact as FactCardFact } from "@/components/FactCard";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/lib/auth";
import placeholderPhoto from "@assets/elementor-placeholder-image_1770884094599.png";
import "../components/HomepageTabs.css";
import "./UserDashboard.css";

type DashboardTab = "for-you" | "following" | "fact-updates" | "local" | "saved";
type SideTab = "feed" | "activity";
type ActivityTab = "submitted" | "approved" | "edit-requests" | "approved-edits" | "comments";

const DASHBOARD_TABS: { id: DashboardTab; label: string }[] = [
  { id: "for-you", label: "For You" },
  { id: "following", label: "Following" },
  { id: "fact-updates", label: "Fact Updates" },
  { id: "local", label: "Local" },
  { id: "saved", label: "Saved" },
];

const ACTIVITY_TABS: { id: ActivityTab; label: string }[] = [
  { id: "submitted", label: "Submitted Posts" },
  { id: "approved", label: "Approved Posts" },
  { id: "edit-requests", label: "Edit Requests" },
  { id: "approved-edits", label: "Approved Edits" },
  { id: "comments", label: "Comments" },
];

const MAIN_CATEGORIES = ["History", "Life Sciences", "Health & Fitness", "Social Sciences", "Gender & Sexuality", "Everyday Life"];

const CATEGORY_COLORS: Record<string, string> = {
  "History": "#D29E00",
  "Life Sciences": "#419F36",
  "Health & Fitness": "#EC7200",
  "Social Sciences": "#9D0085",
  "Gender & Sexuality": "#FF6F98",
  "Everyday Life": "#0167A2",
};

function getMainCategory(categories: string[]): string {
  if (!categories || categories.length === 0) return "Everyday Life";
  const main = categories.find((c) => MAIN_CATEGORIES.includes(c));
  return main || categories[0];
}

function getCategoryColor(categories: string[]): string {
  const cat = getMainCategory(categories);
  return CATEGORY_COLORS[cat] || "#2C2C2C";
}

const FACTS_PER_PAGE = 10;

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
  const [feedTab, setFeedTab] = useState<DashboardTab>("for-you");
  const [sideTab, setSideTab] = useState<SideTab>("feed");
  const [activityTab, setActivityTab] = useState<ActivityTab>("submitted");
  const [feedPage, setFeedPage] = useState(1);

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
  const [editTags, setEditTags] = useState<string[]>(user?.favoriteTags || []);
  const [tagSearch, setTagSearch] = useState("");
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const tagSearchRef = useRef<HTMLDivElement>(null);

  type TagsByCategory = Record<string, Record<string, string[]>>;
  const { data: tagsByCategory } = useQuery<TagsByCategory>({
    queryKey: ["/api/facts/tags-by-category"],
  });

  const allAvailableTags: string[] = tagsByCategory
    ? Array.from(
        new Set(
          Object.values(tagsByCategory).flatMap((cat) =>
            Object.values(cat).flat()
          )
        )
      ).sort()
    : [];

  const filteredSearchTags = tagSearch.trim()
    ? allAvailableTags.filter(
        (t) =>
          t.toLowerCase().includes(tagSearch.toLowerCase()) &&
          !editTags.includes(t)
      )
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tagSearchRef.current && !tagSearchRef.current.contains(e.target as Node)) {
        setTagDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const MAX_TAGS = 20;

  interface DbFact {
    id: string;
    slug: string;
    categories: string[];
    mythHeader: string;
    truthHeader: string;
    coverPhoto?: string | null;
    factFilters?: string[] | null;
    searchTags?: string[] | null;
    betaOnly?: boolean | null;
    createdAt?: string | null;
  }

  const tagsParam = user?.favoriteTags?.join(",") || "";
  const [allForYouFacts, setAllForYouFacts] = useState<DbFact[]>([]);
  const [forYouHasMore, setForYouHasMore] = useState(true);
  const [forYouLoadingMore, setForYouLoadingMore] = useState(false);

  const { isLoading: forYouLoading } = useQuery<{ facts: DbFact[]; total: number; totalPages: number }>({
    queryKey: ["/api/facts/by-tags", tagsParam, 1],
    queryFn: async () => {
      if (!tagsParam) return { facts: [], total: 0, totalPages: 0 };
      const res = await fetch(`/api/facts/by-tags?tags=${encodeURIComponent(tagsParam)}&page=1&limit=${FACTS_PER_PAGE}`);
      const data = await res.json();
      setAllForYouFacts(data.facts || []);
      setForYouHasMore((data.totalPages || 0) > 1);
      setFeedPage(1);
      return data;
    },
    enabled: feedTab === "for-you" && !!tagsParam,
  });

  const handleLoadMore = useCallback(async () => {
    if (forYouLoadingMore || !forYouHasMore) return;
    setForYouLoadingMore(true);
    const nextPage = feedPage + 1;
    try {
      const res = await fetch(`/api/facts/by-tags?tags=${encodeURIComponent(tagsParam)}&page=${nextPage}&limit=${FACTS_PER_PAGE}`);
      const data = await res.json();
      setAllForYouFacts((prev) => [...prev, ...(data.facts || [])]);
      setForYouHasMore(nextPage < (data.totalPages || 0));
      setFeedPage(nextPage);
    } catch {
      // silently fail
    } finally {
      setForYouLoadingMore(false);
    }
  }, [feedPage, tagsParam, forYouLoadingMore, forYouHasMore]);

  const forYouFacts: FactCardFact[] = useMemo(() => {
    return allForYouFacts.map((f) => {
      const mainCat = getMainCategory(f.categories);
      return {
        id: f.id,
        category: mainCat.toUpperCase(),
        categoryColor: getCategoryColor(f.categories),
        myth: f.mythHeader,
        truth: f.truthHeader,
        factFilters: f.factFilters || [],
        dateAdded: f.createdAt ? new Date(f.createdAt).toISOString().split("T")[0] : undefined,
        link: `/fact/${f.slug}`,
        coverPhoto: f.coverPhoto || undefined,
        betaOnly: f.betaOnly || false,
      };
    });
  }, [allForYouFacts]);

  const handleFeedTabChange = useCallback((tab: DashboardTab) => {
    setFeedTab(tab);
    if (tab === "for-you") {
      setAllForYouFacts([]);
      setForYouHasMore(true);
      setFeedPage(1);
    }
  }, []);

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
      <SingleFactHeader onMenuClick={() => setIsMenuOpen(!isMenuOpen)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="user-dashboard-content">
        <div className="dashboard-tri-column" data-testid="dashboard-tri-column">
          <nav className="dashboard-side-tabs" data-testid="dashboard-side-tabs">
            <button
              className={`dashboard-side-tab${sideTab === "feed" ? " dashboard-side-tab-active" : ""}`}
              onClick={() => setSideTab("feed")}
              data-testid="button-side-tab-feed"
            >
              Feed
              {sideTab === "feed" && <div className="dashboard-side-tab-indicator" />}
            </button>
            <button
              className={`dashboard-side-tab${sideTab === "activity" ? " dashboard-side-tab-active" : ""}`}
              onClick={() => setSideTab("activity")}
              data-testid="button-side-tab-activity"
            >
              My Activity
              {sideTab === "activity" && <div className="dashboard-side-tab-indicator" />}
            </button>
          </nav>

          <div className="dashboard-center-column">
              {sideTab === "feed" && (
                <>
                  <div className="dashboard-feed-tabs-wrapper">
                    <nav className="dashboard-feed-tabs" data-testid="dashboard-feed-tabs">
                      {DASHBOARD_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          className={`homepage-tab${feedTab === tab.id ? " homepage-tab-active" : ""}`}
                          onClick={() => handleFeedTabChange(tab.id)}
                          data-testid={`button-feed-tab-${tab.id}`}
                        >
                          <span className="homepage-tab-text">{tab.label}</span>
                          {feedTab === tab.id && <div className="homepage-tab-indicator" />}
                        </button>
                      ))}
                    </nav>
                    <div className="homepage-tabs-divider" />
                  </div>

                  <div className="dashboard-feed-content" data-testid="dashboard-feed-content">
                    {feedTab === "for-you" && (
                      <>
                        {!tagsParam ? (
                          <div className="dashboard-feed-empty" data-testid="feed-empty-for-you">
                            <Search size={40} className="dashboard-feed-empty-icon" />
                            <p className="dashboard-feed-empty-title">No favorite subjects yet</p>
                            <p className="dashboard-feed-empty-desc">
                              Add subjects in your profile to see personalized facts here.
                            </p>
                            <button
                              className="dashboard-feed-empty-action"
                              onClick={() => setEditModalOpen(true)}
                              data-testid="button-add-subjects"
                            >
                              Add Subjects
                            </button>
                          </div>
                        ) : forYouLoading ? (
                          <div className="dashboard-feed-loading" data-testid="feed-loading">
                            <div className="dashboard-feed-spinner" />
                            <p>Loading your feed...</p>
                          </div>
                        ) : forYouFacts.length === 0 ? (
                          <div className="dashboard-feed-empty" data-testid="feed-empty-no-results">
                            <Search size={40} className="dashboard-feed-empty-icon" />
                            <p className="dashboard-feed-empty-title">No matching facts found</p>
                            <p className="dashboard-feed-empty-desc">
                              Try adding more subjects to your profile to discover new facts.
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="dashboard-feed-grid" data-testid="feed-grid-for-you">
                              {forYouFacts.map((fact) => (
                                <FactCard
                                  key={fact.id}
                                  fact={fact}
                                  onSave={() => {}}
                                  onShare={() => {}}
                                  onComment={() => {}}
                                />
                              ))}
                            </div>
                            {forYouHasMore && (
                              <div className="dashboard-feed-load-more" data-testid="feed-load-more">
                                <button
                                  className="dashboard-feed-load-more-btn"
                                  onClick={handleLoadMore}
                                  disabled={forYouLoadingMore}
                                  data-testid="button-load-more"
                                >
                                  {forYouLoadingMore ? "Loading..." : "Load More"}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {feedTab === "following" && (
                      <div className="dashboard-feed-empty" data-testid="feed-empty-following">
                        <Users size={40} className="dashboard-feed-empty-icon" />
                        <p className="dashboard-feed-empty-title">You're not following anyone yet</p>
                        <p className="dashboard-feed-empty-desc">
                          Follow other users to see their activity and shared facts here.
                        </p>
                      </div>
                    )}

                    {feedTab === "fact-updates" && (
                      <div className="dashboard-feed-empty" data-testid="feed-empty-fact-updates">
                        <BellRing size={40} className="dashboard-feed-empty-icon" />
                        <p className="dashboard-feed-empty-title">You aren't following any facts yet.</p>
                        <p className="dashboard-feed-empty-desc">
                          Updates from facts you follow will be here.
                        </p>
                      </div>
                    )}

                    {feedTab === "local" && (
                      <div className="dashboard-feed-empty" data-testid="feed-empty-local">
                        <MapPinned size={40} className="dashboard-feed-empty-icon" />
                        <p className="dashboard-feed-empty-title">
                          {user.currentLocation
                            ? "No local facts available yet"
                            : "Set your location to see local facts"}
                        </p>
                        <p className="dashboard-feed-empty-desc">
                          {user.currentLocation
                            ? "Facts related to your region will appear here as they're added."
                            : "Add your current location in your profile to discover regionally relevant facts."}
                        </p>
                        {!user.currentLocation && (
                          <button
                            className="dashboard-feed-empty-action"
                            onClick={() => setEditModalOpen(true)}
                            data-testid="button-add-location"
                          >
                            Add Location
                          </button>
                        )}
                      </div>
                    )}

                    {feedTab === "saved" && (
                      <div className="dashboard-feed-empty" data-testid="feed-empty-saved">
                        <Bookmark size={40} className="dashboard-feed-empty-icon" />
                        <p className="dashboard-feed-empty-title">No saved facts yet</p>
                        <p className="dashboard-feed-empty-desc">
                          Bookmark facts you want to revisit and they'll show up here.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {sideTab === "activity" && (
                <>
                  <div className="dashboard-feed-tabs-wrapper">
                    <nav className="dashboard-feed-tabs" data-testid="dashboard-activity-tabs">
                      {ACTIVITY_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          className={`homepage-tab${activityTab === tab.id ? " homepage-tab-active" : ""}`}
                          onClick={() => setActivityTab(tab.id)}
                          data-testid={`button-activity-tab-${tab.id}`}
                        >
                          <span className="homepage-tab-text">{tab.label}</span>
                          {activityTab === tab.id && <div className="homepage-tab-indicator" />}
                        </button>
                      ))}
                    </nav>
                    <div className="homepage-tabs-divider" />
                  </div>

                  <div className="dashboard-feed-content" data-testid="dashboard-activity-content">
                    {activityTab === "submitted" && (
                      <div className="dashboard-feed-empty" data-testid="activity-empty-submitted">
                        <FileText size={40} className="dashboard-feed-empty-icon" />
                        <p className="dashboard-feed-empty-title">You haven't submitted any facts yet.</p>
                        <p className="dashboard-feed-empty-desc">
                          Submit a fact to share your experiences.
                        </p>
                      </div>
                    )}

                    {activityTab === "approved" && (
                      <div className="dashboard-feed-empty" data-testid="activity-empty-approved">
                        <CheckCircle size={40} className="dashboard-feed-empty-icon" />
                        <p className="dashboard-feed-empty-title">You don't have any approved posts yet.</p>
                        <p className="dashboard-feed-empty-desc">
                          You'll be notified by email when your submissions are approved.
                        </p>
                      </div>
                    )}

                    {activityTab === "edit-requests" && (
                      <div className="dashboard-feed-empty" data-testid="activity-empty-edit-requests">
                        <FilePenLine size={40} className="dashboard-feed-empty-icon" />
                        <p className="dashboard-feed-empty-title">You haven't requested an edit to any entry yet.</p>
                        <p className="dashboard-feed-empty-desc">
                          Submit a request if you feel like an entry's information is incorrect or could be improved.
                        </p>
                      </div>
                    )}

                    {activityTab === "approved-edits" && (
                      <div className="dashboard-feed-empty" data-testid="activity-empty-approved-edits">
                        <CheckCircle size={40} className="dashboard-feed-empty-icon" />
                        <p className="dashboard-feed-empty-title">You haven't requested an edit to any entry yet.</p>
                        <p className="dashboard-feed-empty-desc">
                          Submit a request if you feel like an entry's information is incorrect or could be improved.
                        </p>
                      </div>
                    )}

                    {activityTab === "comments" && (
                      <div className="dashboard-feed-empty" data-testid="activity-empty-comments">
                        <MessageSquare size={40} className="dashboard-feed-empty-icon" />
                        <p className="dashboard-feed-empty-title">You haven't commented on any topics yet.</p>
                        <p className="dashboard-feed-empty-desc">
                          Leave a comment on a misconception you care about to share your experiences.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
          </div>

          <aside className="dashboard-profile-card" data-testid="user-profile-card">
            <button
              className="profile-card-edit-button"
              onClick={() => setEditModalOpen(true)}
              aria-label="Edit profile"
              data-testid="button-edit-profile"
            >
              <Pencil size={16} />
            </button>

            <div className="profile-card-photo-wrapper">
              <img
                src={user.profilePhoto || placeholderPhoto}
                alt={`${user.username}'s profile photo`}
                className="profile-card-photo"
                data-testid="img-profile-photo"
              />
            </div>

            <h2 className="profile-card-username" data-testid="text-username">
              {user.username}
            </h2>

            <div className="profile-card-locations" data-testid="user-profile-locations">
              <div className="profile-card-current-location">
                {user.currentLocation ? (
                  <span className="profile-card-location-item" data-testid="text-current-location">
                    <MapPin size={12} />
                    {user.currentLocation}
                  </span>
                ) : (
                  <span className="profile-card-empty" data-testid="text-location-empty">--</span>
                )}
              </div>
              {user.placesLived.length > 0 && (
                <div className="profile-card-places-lived">
                  <Home size={12} className="profile-card-places-icon" />
                  {visiblePlaces.map((loc, index) => (
                    <span key={loc}>
                      {index > 0 && (
                        <span className="profile-card-separator">  •  </span>
                      )}
                      <span className="profile-card-place-item" data-testid={`text-place-lived-${index}`}>
                        {loc}
                      </span>
                    </span>
                  ))}
                  {hasMorePlaces && (
                    <button
                      type="button"
                      className="profile-card-view-more"
                      onClick={() => setShowAllPlaces(!showAllPlaces)}
                      data-testid="button-view-more-places"
                    >
                      {showAllPlaces ? "Show less" : "+View more"}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="profile-card-section" data-testid="user-profile-tags-section">
              <h3 className="profile-card-section-label">FAVORITE SUBJECTS</h3>
              {user.favoriteTags.length > 0 ? (
                <div className="profile-card-tags-row" data-testid="user-profile-tags">
                  {visibleTags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tags/${getTagSlug(tag)}`}
                      className="profile-card-tag-chip"
                      data-testid={`profile-tag-${getTagSlug(tag)}`}
                    >
                      {tag.toLowerCase()}
                    </Link>
                  ))}
                  {hasMoreTags && (
                    <button
                      type="button"
                      className="profile-card-view-more"
                      onClick={() => setShowAllTags(!showAllTags)}
                      data-testid="button-view-more-tags"
                    >
                      {showAllTags ? "Show less" : "+View more"}
                    </button>
                  )}
                </div>
              ) : (
                <span className="profile-card-empty" data-testid="text-tags-empty">--</span>
              )}
            </div>

            <div className="profile-card-section" data-testid="user-profile-misinfo-section">
              <h3 className="profile-card-section-label">
                THE #1 SOURCE OF MISINFORMATION IN MY LIFE IS
              </h3>
              {user.misinfoSource ? (
                <p className="profile-card-misinfo-answer" data-testid="text-misinfo-answer">
                  {user.misinfoSource}
                </p>
              ) : (
                <span className="profile-card-empty" data-testid="text-misinfo-empty">--</span>
              )}
            </div>
          </aside>
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
              <div className="edit-profile-locations-columns" data-testid="edit-locations-section">
                <div className="edit-profile-location-column" data-testid="edit-current-location-column">
                  <label className="edit-profile-label">CURRENT LOCATION</label>
                  {editCurrentCountry === "United States" ? (
                    <div className="edit-profile-location-inline-row">
                      <div className="edit-profile-location-inline-field">
                        <StateSelect
                          value={editCurrentState}
                          onChange={setEditCurrentState}
                          testId="input-edit-current-state"
                        />
                      </div>
                      <div className="edit-profile-location-inline-field">
                        <LocationSelect
                          value={editCurrentCountry}
                          onChange={(val) => {
                            setEditCurrentCountry(val);
                            if (val !== "United States") setEditCurrentState("");
                          }}
                          testId="input-edit-current-country"
                          icon="pin"
                        />
                      </div>
                    </div>
                  ) : (
                    <LocationSelect
                      value={editCurrentCountry}
                      onChange={(val) => {
                        setEditCurrentCountry(val);
                        if (val !== "United States") setEditCurrentState("");
                      }}
                      testId="input-edit-current-country"
                      icon="pin"
                    />
                  )}
                  <div className="edit-profile-checkbox-row" data-testid="checkbox-show-current-location">
                    <input
                      type="checkbox"
                      id="show-current-location"
                      checked={editShowCurrentLocation}
                      onChange={(e) => setEditShowCurrentLocation(e.target.checked)}
                    />
                    <label htmlFor="show-current-location">Display on my public profile</label>
                  </div>
                </div>

                <div className="edit-profile-location-column" data-testid="edit-places-lived-column">
                  <label className="edit-profile-label">PLACES I'VE LIVED</label>
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
                    <label htmlFor="show-places-lived">Display on my public profile</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="edit-profile-section">
              <div className="edit-profile-tags-header">
                <label className="edit-profile-label">FAVORITE SUBJECTS</label>
                <div className="edit-profile-tag-search-wrapper" ref={tagSearchRef}>
                  <div className="edit-profile-tag-search-input-wrapper">
                    <Search size={14} className="edit-profile-tag-search-icon" />
                    <input
                      type="text"
                      className="edit-profile-tag-search-input"
                      value={tagSearch}
                      onChange={(e) => {
                        setTagSearch(e.target.value);
                        if (!tagDropdownOpen) setTagDropdownOpen(true);
                      }}
                      onFocus={() => setTagDropdownOpen(true)}
                      placeholder="Search tags..."
                      disabled={editTags.length >= MAX_TAGS}
                      data-testid="input-search-tags"
                    />
                  </div>
                  {tagDropdownOpen && tagSearch.trim() && (
                    <div className="edit-profile-tag-dropdown" data-testid="dropdown-search-tags">
                      {filteredSearchTags.length > 0 ? (
                        filteredSearchTags.map((tag) => (
                          <div
                            key={tag}
                            className="edit-profile-tag-dropdown-item"
                            onClick={() => {
                              if (editTags.length < MAX_TAGS) {
                                setEditTags([...editTags, tag]);
                              }
                              setTagSearch("");
                              setTagDropdownOpen(false);
                            }}
                            data-testid={`dropdown-tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            {tag.toLowerCase()}
                          </div>
                        ))
                      ) : (
                        <div className="edit-profile-tag-dropdown-empty">No matches</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="signin-topic-tags-container" data-testid="edit-tags-container">
                <div className="signin-topic-tags">
                  {editTags.length > 0 ? (
                    editTags.map((tag) => (
                      <button
                        key={tag}
                        className="signin-topic-tag-chip"
                        onClick={() => setEditTags(editTags.filter((t) => t !== tag))}
                        data-testid={`button-edit-tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <span>{tag.toLowerCase()}</span>
                        <XCircle size={16} className="signin-tag-deselect" />
                      </button>
                    ))
                  ) : (
                    <span className="signin-topic-tags-placeholder">Click tags or search to add subjects</span>
                  )}
                </div>
              </div>
              <div className={`edit-profile-char-count${editTags.length >= MAX_TAGS ? " edit-profile-count-max" : ""}`} data-testid="text-tag-count">
                {editTags.length}/{MAX_TAGS}
              </div>
            </div>

            <div className="edit-profile-section">
              <label className="edit-profile-label">
                THE #1 SOURCE OF MISINFORMATION IN MY LIFE IS
              </label>
              <div className="edit-profile-textarea-wrapper">
                <textarea
                  className="edit-profile-textarea"
                  value={editMisinfo}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) setEditMisinfo(e.target.value);
                  }}
                  maxLength={200}
                  placeholder="E.g: magazines, family, friends, social media"
                  data-testid="input-edit-misinfo"
                />
                <div className="edit-profile-char-count" data-testid="text-char-count">
                  {editMisinfo.length}/200
                </div>
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
