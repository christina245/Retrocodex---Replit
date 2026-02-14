import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { MapPin, Pencil, X, Home, Plus, Minus, XCircle, Search, Bookmark, Users, MapPinned, BellRing, FileText, MessageSquare, FilePenLine, CheckCircle, Newspaper, UserRoundPen, PenLine, Settings, LogOut, Shield, Bell, User, Trash2, Lock, CornerUpLeft, Heart, Share2 } from "lucide-react";
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
import { NotificationBell } from "@/components/NotificationBell";
import "../components/ExtendedFactCard.css";
import "../components/CommentsSection.css";
import "./UserDashboard.css";

type DashboardTab = "for-you" | "following" | "local" | "saved";
type SideTab = "feed" | "notifications" | "edit-profile" | "activity" | "settings";
type NotificationsTab = "all" | "replies" | "comments" | "fact-updates";
type ActivityTab = "submitted" | "approved" | "edit-requests" | "approved-edits" | "comments";
type ProfileActivityTab = "submissions" | "edits" | "comments";

const DASHBOARD_TABS: { id: DashboardTab; label: string }[] = [
  { id: "for-you", label: "For You" },
  { id: "following", label: "Following" },
  { id: "local", label: "Local" },
  { id: "saved", label: "Saved" },
];

const PROFILE_ACTIVITY_TABS: { id: ProfileActivityTab; label: string }[] = [
  { id: "submissions", label: "Submissions" },
  { id: "edits", label: "Edits" },
  { id: "comments", label: "Comments" },
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
  const { user, isLoggedIn, logout } = useAuth();
  const [, navigate] = useLocation();
  const initialTab = (() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["feed", "notifications", "edit-profile", "activity", "settings"].includes(tab)) {
      return tab as SideTab;
    }
    return "feed" as SideTab;
  })();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showAllPlaces, setShowAllPlaces] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [feedTab, setFeedTab] = useState<DashboardTab>("for-you");
  const [sideTab, setSideTab] = useState<SideTab>(initialTab);
  const [notificationsTab, setNotificationsTab] = useState<NotificationsTab>("all");
  const [activityTab, setActivityTab] = useState<ActivityTab>("submitted");
  const [profileActivityTab, setProfileActivityTab] = useState<ProfileActivityTab>("submissions");
  const [bioEditOpen, setBioEditOpen] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [allowFollows, setAllowFollows] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [notifyFollows, setNotifyFollows] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyFactUpdates, setNotifyFactUpdates] = useState(true);
  const [emailNotifyFollows, setEmailNotifyFollows] = useState(true);
  const [emailNotifyComments, setEmailNotifyComments] = useState(true);
  const [emailNotifyFactUpdates, setEmailNotifyFactUpdates] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [notificationCount] = useState(3);


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

  const demoFacts: FactCardFact[] = [
    {
      id: "aa5b0b21-1ee7-4996-88ef-ad0c4490adc7",
      category: "HISTORY",
      categoryColor: getCategoryColor(["History"]),
      myth: "When the Mexica first met Spanish explorer Hernán Cortés, they believed he was a god.",
      truth: "They might have assumed that the Spanish were representatives of their own god, which was misinterpreted by the Spanish.",
      factFilters: [],
      link: "/fact/mesoamericans-and-europeans-gods",
      coverPhoto: "/uploads/1764719426643-922952402.png",
      betaOnly: false,
    },
    {
      id: "b1b9f88b-3d4e-4eaa-ad36-0380266ec46c",
      category: "HEALTH & FITNESS",
      categoryColor: getCategoryColor(["Health & Fitness"]),
      myth: "You can burn belly fat by doing crunches and other ab workouts.",
      truth: "Any exercise targeting a specific part of the body only builds muscle. These exercises cannot directly accelerate fat loss in the targeted area.",
      factFilters: [],
      link: "/fact/belly-fat-by-doing-ab-workouts",
      coverPhoto: "/uploads/1764752045366-476242776.png",
      betaOnly: false,
    },
    {
      id: "a7aded15-3242-4c41-b644-a51048c90308",
      category: "EVERYDAY LIFE",
      categoryColor: getCategoryColor(["Everyday Life"]),
      myth: "Cracking your knuckles will give you arthritis.",
      truth: "No scientific evidence has yet to link cracking your knuckles and arthritis.",
      factFilters: [],
      link: "/fact/cracking-your-knuckles-arthritis",
      coverPhoto: "/uploads/1764735935195-591724829.png",
      betaOnly: false,
    },
    {
      id: "e6bc520c-dd26-4376-be25-4862b9ee9e92",
      category: "HEALTH & FITNESS",
      categoryColor: getCategoryColor(["Health & Fitness", "Everyday Life"]),
      myth: "Breakfast is the most important meal of the day.",
      truth: "While eating breakfast can be beneficial for certain lifestyles, research shows that its importance varies widely based on individual metabolism, cultural norms, and overall diet.",
      factFilters: [],
      link: "/fact/breakfast-most-important-meal-of-the-day",
      coverPhoto: "/uploads/1765021400264-394912154.png",
      betaOnly: false,
    },
  ];

  const handleFeedTabChange = useCallback((tab: DashboardTab) => {
    setFeedTab(tab);
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
        <div className="dashboard-two-column" data-testid="dashboard-two-column">
          <nav className="dashboard-side-tabs" data-testid="dashboard-side-tabs">
            <div className="dashboard-side-tabs-top">
              <button
                className={`dashboard-side-tab${sideTab === "feed" ? " dashboard-side-tab-active" : ""}`}
                onClick={() => setSideTab("feed")}
                data-testid="button-side-tab-feed"
              >
                <Newspaper size={20} className="dashboard-side-tab-icon" />
                <span>Feed</span>
              </button>
              <button
                className={`dashboard-side-tab dashboard-side-tab-notifications${sideTab === "notifications" ? " dashboard-side-tab-active" : ""}`}
                onClick={() => setSideTab("notifications")}
                data-testid="button-side-tab-notifications"
              >
                <NotificationBell count={notificationCount} size={20} className="dashboard-side-tab-bell" testId="sidebar-notification-bell" />
                <span>Activity</span>
              </button>
              <button
                className={`dashboard-side-tab${sideTab === "edit-profile" ? " dashboard-side-tab-active" : ""}`}
                onClick={() => setSideTab("edit-profile")}
                data-testid="button-side-tab-edit-profile"
              >
                <UserRoundPen size={20} className="dashboard-side-tab-icon" />
                <span>Edit Profile</span>
              </button>
              <button
                className={`dashboard-side-tab${sideTab === "activity" ? " dashboard-side-tab-active" : ""}`}
                onClick={() => setSideTab("activity")}
                data-testid="button-side-tab-activity"
              >
                <PenLine size={20} className="dashboard-side-tab-icon" />
                <span>Submissions</span>
              </button>
              <button
                className={`dashboard-side-tab${sideTab === "settings" ? " dashboard-side-tab-active" : ""}`}
                onClick={() => setSideTab("settings")}
                data-testid="button-side-tab-settings"
              >
                <Settings size={20} className="dashboard-side-tab-icon" />
                <span>Settings</span>
              </button>
            </div>
            <div className="dashboard-side-tabs-bottom">
              <button
                className="dashboard-side-tab dashboard-side-tab-logout"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                data-testid="button-logout"
              >
                <LogOut size={20} className="dashboard-side-tab-icon" />
                <span>Log Out</span>
              </button>
            </div>
          </nav>

          <div className="dashboard-center-column">
              {sideTab === "feed" && (
                <>
                  <div className="notifications-tabs-wrapper">
                    <nav className="notifications-tabs" data-testid="dashboard-feed-tabs">
                      {DASHBOARD_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          className={`notifications-tab${feedTab === tab.id ? " notifications-tab-active" : ""}`}
                          onClick={() => handleFeedTabChange(tab.id)}
                          data-testid={`button-feed-tab-${tab.id}`}
                        >
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="dashboard-feed-content" data-testid="dashboard-feed-content">
                    {feedTab === "for-you" && (
                      <div className="dashboard-feed-grid" data-testid="feed-grid-for-you">
                        {demoFacts.map((fact) => (
                          <FactCard
                            key={fact.id}
                            fact={fact}
                            onSave={() => {}}
                            onShare={() => {}}
                            onComment={() => {}}
                          />
                        ))}
                      </div>
                    )}

                    {feedTab === "following" && (
                      <div className="following-feed" data-testid="feed-following">
                        <div className="following-post" data-testid="following-post-1">
                          <div className="following-post-header">
                            <img src={placeholderPhoto} alt="LogicGamer_01" className="following-post-avatar" />
                            <div className="following-post-header-text">
                              <Link href="/user/LogicGamer_01" className="following-post-username" data-testid="link-user-LogicGamer_01">LogicGamer_01</Link>
                              <span className="following-post-action">submitted a new topic</span>
                            </div>
                            <span className="following-post-timestamp">2 mins ago</span>
                          </div>
                          <div className="following-post-body following-post-factcard">
                            <FactCard
                              fact={{
                                id: "does-eating-sugar-make-kids-hyper",
                                category: "EVERYDAY LIFE",
                                categoryColor: "#0167A2",
                                myth: "Eating too much sugar makes kids hyper.",
                                truth: "There isn't a direct causal link between sugar and hyperactivity. Sugary foods are more likely to be present during exciting activities like birthday parties, creating an illusory correlation.",
                                link: "/fact/does-eating-sugar-make-kids-hyper",
                                coverPhoto: "/objects/uploads/74054346-bf6b-4820-9ace-6c5b7127937b.png",
                              }}
                              onSave={() => {}}
                              onShare={() => {}}
                              onComment={() => {}}
                            />
                          </div>
                        </div>

                        <div className="following-post" data-testid="following-post-2">
                          <div className="following-post-header">
                            <img src={placeholderPhoto} alt="DungeonMaster_88" className="following-post-avatar" />
                            <div className="following-post-header-text">
                              <Link href="/user/DungeonMaster_88" className="following-post-username" data-testid="link-user-DungeonMaster_88">DungeonMaster_88</Link>
                              <span className="following-post-action">voted on a poll</span>
                            </div>
                            <span className="following-post-timestamp">15 mins ago</span>
                          </div>
                          <div className="following-post-body">
                            <Link href="/fact/food-pyramid-healthy-diet" className="following-post-link">
                              <p className="fact-myth">"The Food Pyramid is the model for a healthy, balanced diet."</p>
                            </Link>
                            <div className="following-poll-response" data-testid="following-poll-response">
                              <p className="following-poll-question">Were you taught this information?</p>
                              <div className="following-poll-selection">
                                <div className="following-poll-radio-filled" />
                                <span className="following-poll-answer">Yes, in school</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="following-post" data-testid="following-post-3">
                          <div className="following-post-header">
                            <img src={placeholderPhoto} alt="NullPointerExcep" className="following-post-avatar" />
                            <div className="following-post-header-text">
                              <Link href="/user/NullPointerExcep" className="following-post-username" data-testid="link-user-NullPointerExcep">NullPointerExcep</Link>
                              <span className="following-post-action">liked a comment on</span>
                              <Link href="/fact/you-only-use-10-percent-of-your-brain" className="following-post-fact-title">"Do you only use 10% of your brain?"</Link>
                            </div>
                            <span className="following-post-timestamp">1 hour ago</span>
                          </div>
                          <div className="following-post-body">
                            <div className="following-comment-quote" data-testid="following-comment-quote-1">
                              <p className="following-comment-text">"Evolutionarily speaking, maintaining an organ that consumes 20% of your energy while only using 10% of its capacity would be impossible..."</p>
                            </div>
                          </div>
                        </div>

                        <div className="following-post" data-testid="following-post-4">
                          <div className="following-post-header">
                            <img src={placeholderPhoto} alt="Ackshually_42" className="following-post-avatar" />
                            <div className="following-post-header-text">
                              <Link href="/user/Ackshually_42" className="following-post-username" data-testid="link-user-Ackshually_42">Ackshually_42</Link>
                              <span className="following-post-action">commented on</span>
                              <Link href="/fact/christopher-columbus-discovered-americas" className="following-post-fact-title">"Christopher Columbus discovered the Americas in 1492"</Link>
                            </div>
                            <span className="following-post-timestamp">3 hours ago</span>
                          </div>
                          <div className="following-post-body">
                            <p className="following-plain-comment" data-testid="following-plain-comment">Ackshually, to be pedantic, the term 'discovery' is a Eurocentric misnomer. Not only were millions of Indigenous people already inhabitant of the land, but the Norse explorer Leif Erikson had already established a settlement at L'Anse aux Meadows nearly five centuries prior. Columbus didn't even set foot on the North American mainland during his 1492 voyage; he was strictly in the Caribbean.</p>
                            <div className="comment-actions" data-testid="following-comment-actions">
                              <button className="comment-action disabled-action" data-testid="button-reply-following">
                                <CornerUpLeft size={14} />
                                <span>Reply</span>
                              </button>
                              <button className="comment-action disabled-action" data-testid="button-like-following">
                                <Heart size={14} />
                                <span>12 likes</span>
                              </button>
                              <button className="comment-action disabled-action" data-testid="button-save-following">
                                <Bookmark size={14} />
                                <span>Save</span>
                              </button>
                              <button className="comment-action disabled-action" data-testid="button-share-following">
                                <Share2 size={14} />
                                <span>Share</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {feedTab === "local" && (
                      <div className="following-feed" data-testid="feed-local">
                        <p className="local-feed-description" data-testid="local-feed-description">Activity from users currently located in your current or past locations.</p>

                        <div className="following-post" data-testid="local-post-1">
                          <div className="following-post-header">
                            <img src={placeholderPhoto} alt="CtrlAltDefeat" className="following-post-avatar" />
                            <div className="following-post-header-text">
                              <Link href="/user/CtrlAltDefeat" className="following-post-username" data-testid="link-user-CtrlAltDefeat">CtrlAltDefeat</Link>
                              <span className="following-post-action">from</span>
                              <span className="following-post-location" data-testid="local-location-1">New York, United States</span>
                              <span className="following-post-action">submitted a new topic</span>
                            </div>
                            <span className="following-post-timestamp">5 mins ago</span>
                          </div>
                          <div className="following-post-body following-post-factcard">
                            <FactCard
                              fact={{
                                id: "tongue-taste-map",
                                category: "LIFE SCIENCES",
                                categoryColor: "#419F36",
                                myth: "The tongue has separate zones for different tastes: sweet at the tip, salty and sour on the sides, and bitter at the back.",
                                truth: "All taste buds can detect all basic tastes. The tongue map myth originated from a misinterpretation of research by Edwin Boring in the 1940s.",
                                link: "/fact/tongue-taste-map",
                                coverPhoto: "/uploads/1764732977459-366971984.png",
                              }}
                              onSave={() => {}}
                              onShare={() => {}}
                              onComment={() => {}}
                            />
                          </div>
                        </div>

                        <div className="following-post" data-testid="local-post-2">
                          <div className="following-post-header">
                            <img src={placeholderPhoto} alt="SyntaxTerror_404" className="following-post-avatar" />
                            <div className="following-post-header-text">
                              <Link href="/user/SyntaxTerror_404" className="following-post-username" data-testid="link-user-SyntaxTerror_404">SyntaxTerror_404</Link>
                              <span className="following-post-action">from</span>
                              <span className="following-post-location" data-testid="local-location-2">Toronto, Canada</span>
                              <span className="following-post-action">voted on a poll</span>
                            </div>
                            <span className="following-post-timestamp">20 mins ago</span>
                          </div>
                          <div className="following-post-body">
                            <Link href="/fact/is-msg-bad-for-you" className="following-post-link">
                              <p className="fact-myth">"MSG is bad for you."</p>
                            </Link>
                            <div className="following-poll-response" data-testid="local-poll-response">
                              <p className="following-poll-question">Were you taught this information?</p>
                              <div className="following-poll-selection">
                                <div className="following-poll-radio-filled" />
                                <span className="following-poll-answer">Yes, by family</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="following-post" data-testid="local-post-3">
                          <div className="following-post-header">
                            <img src={placeholderPhoto} alt="BugHunter_Prime" className="following-post-avatar" />
                            <div className="following-post-header-text">
                              <Link href="/user/BugHunter_Prime" className="following-post-username" data-testid="link-user-BugHunter_Prime">BugHunter_Prime</Link>
                              <span className="following-post-action">from</span>
                              <span className="following-post-location" data-testid="local-location-3">London, United Kingdom</span>
                              <span className="following-post-action">liked a comment on</span>
                              <Link href="/fact/does-muscle-turn-into-fat" className="following-post-fact-title">"Does muscle turn into fat if you don't work out?"</Link>
                            </div>
                            <span className="following-post-timestamp">45 mins ago</span>
                          </div>
                          <div className="following-post-body">
                            <div className="following-comment-quote" data-testid="local-comment-quote-1">
                              <p className="following-comment-text">"Muscle and fat are completely different tissue types. It's biologically impossible for one to transform into the other — that's like saying bone can turn into skin..."</p>
                            </div>
                          </div>
                        </div>

                        <div className="following-post" data-testid="local-post-4">
                          <div className="following-post-header">
                            <img src={placeholderPhoto} alt="CaffeineOverflow" className="following-post-avatar" />
                            <div className="following-post-header-text">
                              <Link href="/user/CaffeineOverflow" className="following-post-username" data-testid="link-user-CaffeineOverflow">CaffeineOverflow</Link>
                              <span className="following-post-action">from</span>
                              <span className="following-post-location" data-testid="local-location-4">Rio de Janeiro, Brazil</span>
                              <span className="following-post-action">commented on</span>
                              <Link href="/fact/sweating-burning-fat" className="following-post-fact-title">"Does sweating mean you're burning fat?"</Link>
                            </div>
                            <span className="following-post-timestamp">1 hour ago</span>
                          </div>
                          <div className="following-post-body">
                            <p className="following-plain-comment" data-testid="local-plain-comment">Living in Rio, people at the gym constantly think sweating buckets equals a better workout. But sweat is just thermoregulation — your body cooling itself down. You can burn tons of calories in cold water swimming without sweating at all.</p>
                            <div className="comment-actions" data-testid="local-comment-actions-1">
                              <button className="comment-action disabled-action" data-testid="button-reply-local-1">
                                <CornerUpLeft size={14} />
                                <span>Reply</span>
                              </button>
                              <button className="comment-action disabled-action" data-testid="button-like-local-1">
                                <Heart size={14} />
                                <span>8 likes</span>
                              </button>
                              <button className="comment-action disabled-action" data-testid="button-save-local-1">
                                <Bookmark size={14} />
                                <span>Save</span>
                              </button>
                              <button className="comment-action disabled-action" data-testid="button-share-local-1">
                                <Share2 size={14} />
                                <span>Share</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="following-post" data-testid="local-post-5">
                          <div className="following-post-header">
                            <img src={placeholderPhoto} alt="PixelWitch_99" className="following-post-avatar" />
                            <div className="following-post-header-text">
                              <Link href="/user/PixelWitch_99" className="following-post-username" data-testid="link-user-PixelWitch_99">PixelWitch_99</Link>
                              <span className="following-post-action">from</span>
                              <span className="following-post-location" data-testid="local-location-5">New York, United States</span>
                              <span className="following-post-action">liked a comment on</span>
                              <Link href="/fact/does-chewing-gum-stay-in-your-stomach" className="following-post-fact-title">"Does chewing gum stay in your stomach for seven years?"</Link>
                            </div>
                            <span className="following-post-timestamp">2 hours ago</span>
                          </div>
                          <div className="following-post-body">
                            <div className="following-comment-quote" data-testid="local-comment-quote-2">
                              <p className="following-comment-text">"Your digestive system isn't just going to give up on something because it's chewy. It passes through like everything else — just on the normal timeline, not seven years later..."</p>
                            </div>
                          </div>
                        </div>

                        <div className="following-post" data-testid="local-post-6">
                          <div className="following-post-header">
                            <img src={placeholderPhoto} alt="RespawnPending" className="following-post-avatar" />
                            <div className="following-post-header-text">
                              <Link href="/user/RespawnPending" className="following-post-username" data-testid="link-user-RespawnPending">RespawnPending</Link>
                              <span className="following-post-action">from</span>
                              <span className="following-post-location" data-testid="local-location-6">Toronto, Canada</span>
                              <span className="following-post-action">voted on a poll</span>
                            </div>
                            <span className="following-post-timestamp">3 hours ago</span>
                          </div>
                          <div className="following-post-body">
                            <Link href="/fact/states-of-matter" className="following-post-link">
                              <p className="fact-myth">"There are three states of matter: solid, liquid, and gas."</p>
                            </Link>
                            <div className="following-poll-response" data-testid="local-poll-response-2">
                              <p className="following-poll-question">Were you taught this information?</p>
                              <div className="following-poll-selection">
                                <div className="following-poll-radio-filled" />
                                <span className="following-poll-answer">Yes, in school</span>
                              </div>
                            </div>
                          </div>
                        </div>
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

              {sideTab === "notifications" && (
                <div className="notifications-page" data-testid="notifications-page">
                  <div className="notifications-tabs-wrapper">
                    <nav className="notifications-tabs" data-testid="notifications-tabs">
                      {([
                        { id: "all" as NotificationsTab, label: "All" },
                        { id: "replies" as NotificationsTab, label: "Replies" },
                        { id: "comments" as NotificationsTab, label: "Comments" },
                        { id: "fact-updates" as NotificationsTab, label: "Fact Updates" },
                      ]).map((tab) => (
                        <button
                          key={tab.id}
                          className={`notifications-tab${notificationsTab === tab.id ? " notifications-tab-active" : ""}`}
                          onClick={() => setNotificationsTab(tab.id)}
                          data-testid={`button-notifications-tab-${tab.id}`}
                        >
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </nav>
                  </div>

                  {notificationsTab === "all" && (
                    <div className="dashboard-feed-empty" data-testid="notifications-empty-all">
                      <Bell size={40} className="dashboard-feed-empty-icon" />
                      <p className="dashboard-feed-empty-title">No new activity</p>
                      <p className="dashboard-feed-empty-desc">
                        New followers, upvotes, replies, comments, and fact updates will appear here.
                      </p>
                    </div>
                  )}

                  {notificationsTab === "replies" && (
                    <div className="dashboard-feed-empty" data-testid="notifications-empty-replies">
                      <MessageSquare size={40} className="dashboard-feed-empty-icon" />
                      <p className="dashboard-feed-empty-title">No replies yet</p>
                      <p className="dashboard-feed-empty-desc">
                        Replies to comments you've left on entries will show up here.
                      </p>
                    </div>
                  )}

                  {notificationsTab === "comments" && (
                    <div className="dashboard-feed-empty" data-testid="notifications-empty-comments">
                      <MessageSquare size={40} className="dashboard-feed-empty-icon" />
                      <p className="dashboard-feed-empty-title">No comments yet</p>
                      <p className="dashboard-feed-empty-desc">
                        Comments on your approved submissions will show up here.
                      </p>
                    </div>
                  )}

                  {notificationsTab === "fact-updates" && (
                    <div className="dashboard-feed-empty" data-testid="notifications-empty-fact-updates">
                      <BellRing size={40} className="dashboard-feed-empty-icon" />
                      <p className="dashboard-feed-empty-title">You aren't following any facts yet</p>
                      <p className="dashboard-feed-empty-desc">
                        Updates to facts you follow will be here.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {sideTab === "edit-profile" && (
                <>
                <div className="dashboard-profile-banner" data-testid="dashboard-profile-banner">
                  <div className="user-profile-banner">
                    <div className="user-profile-photo-wrapper">
                      <img
                        src={user.profilePhoto || placeholderPhoto}
                        alt={`${user.username}'s profile photo`}
                        className="user-profile-photo"
                        data-testid="img-profile-photo"
                      />
                    </div>
                    <div className="user-profile-details">
                      <div className="user-profile-name-row">
                        <h2 className="user-profile-username" data-testid="text-username">
                          {user.username}
                        </h2>
                        <button
                          className="user-profile-edit-button"
                          onClick={() => setEditModalOpen(true)}
                          aria-label="Edit profile"
                          data-testid="button-edit-profile"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>

                      <div className="user-profile-locations-wrapper" data-testid="user-profile-locations">
                        <div className="user-profile-current-location">
                          {user.currentLocation ? (
                            <span className="user-profile-location-item" data-testid="text-current-location">
                              <MapPin size={14} />
                              {user.currentLocation}
                            </span>
                          ) : (
                            <span className="user-profile-empty-text" data-testid="text-location-empty">--</span>
                          )}
                        </div>
                        {user.placesLived.length > 0 && (
                          <div className="user-profile-places-lived">
                            <Home size={14} className="user-profile-places-icon" />
                            {visiblePlaces.map((loc, index) => (
                              <span key={loc}>
                                {index > 0 && (
                                  <span className="user-profile-separator">  {"\u00B7"}  </span>
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

                      <div className="user-profile-section" data-testid="user-profile-tags-section">
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
                          <span className="user-profile-empty-text" data-testid="text-tags-empty">--</span>
                        )}
                      </div>

                      <div className="user-profile-section" data-testid="user-profile-misinfo-section">
                        <h3 className="user-profile-section-label">
                          THE #1 SOURCE OF MISINFORMATION IN MY LIFE IS
                        </h3>
                        {user.misinfoSource ? (
                          <p className="user-profile-misinfo-answer" data-testid="text-misinfo-answer">
                            {user.misinfoSource}
                          </p>
                        ) : (
                          <span className="user-profile-empty-text" data-testid="text-misinfo-empty">--</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="profile-bio-section" data-testid="profile-bio-section">
                  <div className="profile-bio-header">
                    <h3 className="user-profile-section-label">BIO</h3>
                    <button
                      className="user-profile-edit-button"
                      onClick={() => {
                        setEditBio(user.bio || "");
                        setBioEditOpen(true);
                      }}
                      aria-label="Edit bio"
                      data-testid="button-edit-bio"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                  {user.bio ? (
                    <div className="profile-bio-text" data-testid="text-bio">
                      <ReactMarkdown>{user.bio}</ReactMarkdown>
                    </div>
                  ) : (
                    <span className="user-profile-empty-text" data-testid="text-bio-empty">No bio yet.</span>
                  )}
                </div>

                {bioEditOpen && (
                  <div
                    className="edit-profile-overlay"
                    onClick={(e) => { if (e.target === e.currentTarget) setBioEditOpen(false); }}
                    data-testid="bio-edit-overlay"
                  >
                    <div className="edit-profile-modal bio-edit-modal" data-testid="bio-edit-modal">
                      <button
                        className="edit-profile-close"
                        onClick={() => setBioEditOpen(false)}
                        aria-label="Close bio editor"
                        data-testid="button-close-bio-edit"
                      >
                        <X size={20} />
                      </button>
                      <h2 className="edit-profile-title">Edit Bio</h2>
                      <div className="edit-profile-section">
                        <label className="edit-profile-label">BIO (MARKDOWN SUPPORTED)</label>
                        <div className="edit-profile-textarea-wrapper">
                          <textarea
                            className="edit-profile-textarea bio-edit-textarea"
                            value={editBio}
                            onChange={(e) => {
                              if (e.target.value.length <= 2000) setEditBio(e.target.value);
                            }}
                            maxLength={2000}
                            placeholder="Tell the world about yourself..."
                            data-testid="input-edit-bio"
                          />
                          <div className={`edit-profile-char-count${editBio.length >= 2000 ? " edit-profile-count-max" : ""}`} data-testid="text-bio-char-count">
                            {editBio.length}/2000
                          </div>
                        </div>
                      </div>
                      {editBio.trim() && (
                        <div className="bio-edit-preview" data-testid="bio-edit-preview">
                          <label className="edit-profile-label">PREVIEW</label>
                          <div className="profile-bio-text">
                            <ReactMarkdown>{editBio}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        className="edit-profile-save"
                        onClick={() => setBioEditOpen(false)}
                        data-testid="button-save-bio"
                      >
                        Save Bio
                      </button>
                    </div>
                  </div>
                )}

                <div className="profile-activity-section" data-testid="profile-activity-section">
                  <div className="notifications-tabs-wrapper">
                    <nav className="notifications-tabs" data-testid="profile-activity-tabs">
                      {PROFILE_ACTIVITY_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          className={`notifications-tab${profileActivityTab === tab.id ? " notifications-tab-active" : ""}`}
                          onClick={() => setProfileActivityTab(tab.id)}
                          data-testid={`button-profile-activity-tab-${tab.id}`}
                        >
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="dashboard-feed-content" data-testid="profile-activity-content">
                    {profileActivityTab === "submissions" && (
                      <div className="profile-activity-empty" data-testid="profile-activity-empty-submissions">
                        <FileText size={40} className="profile-activity-empty-icon" />
                        <p className="profile-activity-empty-title">No approved submissions yet.</p>
                        <p className="profile-activity-empty-desc">
                          Got a misconception that bothers you? Share it with the world.
                        </p>
                      </div>
                    )}

                    {profileActivityTab === "edits" && (
                      <div className="profile-activity-empty" data-testid="profile-activity-empty-edits">
                        <FilePenLine size={40} className="profile-activity-empty-icon" />
                        <p className="profile-activity-empty-title">No approved edits yet.</p>
                        <p className="profile-activity-empty-desc">
                          Have any information you'd like to add to an existing topic? Submit an edit request on the topic page.
                        </p>
                      </div>
                    )}

                    {profileActivityTab === "comments" && (
                      <div className="profile-activity-empty" data-testid="profile-activity-empty-comments">
                        <MessageSquare size={40} className="profile-activity-empty-icon" />
                        <p className="profile-activity-empty-title">No comments yet.</p>
                        <p className="profile-activity-empty-desc">
                          Leave a comment on any single fact page to share your experiences with the topic.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                </>
              )}

              {sideTab === "activity" && (
                <>
                  <div className="notifications-tabs-wrapper">
                    <nav className="notifications-tabs" data-testid="dashboard-activity-tabs">
                      {ACTIVITY_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          className={`notifications-tab${activityTab === tab.id ? " notifications-tab-active" : ""}`}
                          onClick={() => setActivityTab(tab.id)}
                          data-testid={`button-activity-tab-${tab.id}`}
                        >
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </nav>
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

              {sideTab === "settings" && (
                <div className="settings-page" data-testid="settings-page">
                  <div className="settings-section" data-testid="settings-privacy">
                    <h3 className="settings-section-title">
                      <Shield size={18} className="settings-section-icon" />
                      Privacy
                    </h3>
                    <div className="settings-row" data-testid="settings-row-follows">
                      <div className="settings-row-text">
                        <p className="settings-row-label">Allow others to follow you</p>
                        <p className="settings-row-desc">When turned off, no one can follow your profile</p>
                      </div>
                      <label className="settings-toggle" data-testid="toggle-allow-follows">
                        <input
                          type="checkbox"
                          checked={allowFollows}
                          onChange={() => setAllowFollows(!allowFollows)}
                        />
                        <span className="settings-toggle-slider" />
                      </label>
                    </div>
                    <div className="settings-row" data-testid="settings-row-public-profile">
                      <div className="settings-row-text">
                        <p className="settings-row-label">Public profile</p>
                        <p className="settings-row-desc">When turned off, only you can see your profile page</p>
                      </div>
                      <label className="settings-toggle" data-testid="toggle-public-profile">
                        <input
                          type="checkbox"
                          checked={publicProfile}
                          onChange={() => setPublicProfile(!publicProfile)}
                        />
                        <span className="settings-toggle-slider" />
                      </label>
                    </div>
                  </div>

                  <div className="settings-section" data-testid="settings-notifications">
                    <h3 className="settings-section-title">
                      <Bell size={18} className="settings-section-icon" />
                      Notifications
                    </h3>
                    <div className="settings-row" data-testid="settings-row-notify-follows">
                      <div className="settings-row-text">
                        <p className="settings-row-label">New followers</p>
                        <p className="settings-row-desc">Get notified when someone follows you</p>
                      </div>
                      <div className="settings-toggles-group">
                        <div className="settings-toggle-labeled">
                          <span className="settings-toggle-label">On website</span>
                          <label className="settings-toggle" data-testid="toggle-web-notify-follows">
                            <input
                              type="checkbox"
                              checked={notifyFollows}
                              onChange={() => setNotifyFollows(!notifyFollows)}
                            />
                            <span className="settings-toggle-slider" />
                          </label>
                        </div>
                        <div className="settings-toggle-labeled">
                          <span className="settings-toggle-label">Email</span>
                          <label className="settings-toggle" data-testid="toggle-email-notify-follows">
                            <input
                              type="checkbox"
                              checked={emailNotifyFollows}
                              onChange={() => setEmailNotifyFollows(!emailNotifyFollows)}
                            />
                            <span className="settings-toggle-slider" />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="settings-row" data-testid="settings-row-notify-comments">
                      <div className="settings-row-text">
                        <p className="settings-row-label">Comments</p>
                        <p className="settings-row-desc">Get notified when someone replies to your comments</p>
                      </div>
                      <div className="settings-toggles-group">
                        <div className="settings-toggle-labeled">
                          <span className="settings-toggle-label">On website</span>
                          <label className="settings-toggle" data-testid="toggle-web-notify-comments">
                            <input
                              type="checkbox"
                              checked={notifyComments}
                              onChange={() => setNotifyComments(!notifyComments)}
                            />
                            <span className="settings-toggle-slider" />
                          </label>
                        </div>
                        <div className="settings-toggle-labeled">
                          <span className="settings-toggle-label">Email</span>
                          <label className="settings-toggle" data-testid="toggle-email-notify-comments">
                            <input
                              type="checkbox"
                              checked={emailNotifyComments}
                              onChange={() => setEmailNotifyComments(!emailNotifyComments)}
                            />
                            <span className="settings-toggle-slider" />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="settings-row" data-testid="settings-row-notify-fact-updates">
                      <div className="settings-row-text">
                        <p className="settings-row-label">Fact updates</p>
                        <p className="settings-row-desc">Get notified when facts you follow are updated</p>
                      </div>
                      <div className="settings-toggles-group">
                        <div className="settings-toggle-labeled">
                          <span className="settings-toggle-label">On website</span>
                          <label className="settings-toggle" data-testid="toggle-web-notify-fact-updates">
                            <input
                              type="checkbox"
                              checked={notifyFactUpdates}
                              onChange={() => setNotifyFactUpdates(!notifyFactUpdates)}
                            />
                            <span className="settings-toggle-slider" />
                          </label>
                        </div>
                        <div className="settings-toggle-labeled">
                          <span className="settings-toggle-label">Email</span>
                          <label className="settings-toggle" data-testid="toggle-email-notify-fact-updates">
                            <input
                              type="checkbox"
                              checked={emailNotifyFactUpdates}
                              onChange={() => setEmailNotifyFactUpdates(!emailNotifyFactUpdates)}
                            />
                            <span className="settings-toggle-slider" />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="settings-section" data-testid="settings-account">
                    <h3 className="settings-section-title">
                      <User size={18} className="settings-section-icon" />
                      Account
                    </h3>
                    <div className="settings-info-row" data-testid="settings-info-username">
                      <span className="settings-info-label">Username</span>
                      <span className="settings-info-value" data-testid="text-settings-username">{user.username}</span>
                    </div>
                    <div className="settings-info-row" data-testid="settings-info-email">
                      <span className="settings-info-label">Email</span>
                      <span className="settings-info-value" data-testid="text-settings-email">{user.email}</span>
                    </div>
                  </div>

                  <div className="settings-section settings-danger-section" data-testid="settings-danger">
                    <h3 className="settings-section-title settings-danger-title">
                      <Trash2 size={18} className="settings-section-icon" />
                      Delete Account
                    </h3>
                    <p className="settings-danger-desc">
                      Once you delete your account, there is no going back. All your data will be permanently removed.
                    </p>
                    <button
                      className="settings-delete-button"
                      onClick={() => {
                        setDeletePassword("");
                        setDeleteError("");
                        setDeleteModalOpen(true);
                      }}
                      data-testid="button-delete-account"
                    >
                      Delete my account
                    </button>
                  </div>
                </div>
              )}
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

      {deleteModalOpen && (
        <div
          className="edit-profile-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteModalOpen(false); }}
          data-testid="delete-account-overlay"
        >
          <div className="delete-account-modal" data-testid="delete-account-modal">
            <button
              className="edit-profile-close"
              onClick={() => setDeleteModalOpen(false)}
              aria-label="Close delete account dialog"
              data-testid="button-close-delete-modal"
            >
              <X size={20} />
            </button>
            <div className="delete-modal-icon">
              <Trash2 size={32} />
            </div>
            <h2 className="delete-modal-title">Delete your account?</h2>
            <p className="delete-modal-desc">
              This action is permanent and cannot be undone. All your data, including your profile, saved facts, and comments will be permanently deleted.
            </p>
            <div className="delete-modal-field">
              <label className="delete-modal-label">Enter your password to confirm</label>
              <div className="delete-modal-input-wrapper">
                <Lock size={18} className="delete-modal-input-icon" />
                <input
                  type="password"
                  className="delete-modal-input"
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    setDeleteError("");
                  }}
                  placeholder="Password"
                  data-testid="input-delete-password"
                />
              </div>
              {deleteError && (
                <p className="delete-modal-error" data-testid="text-delete-error">{deleteError}</p>
              )}
            </div>
            <div className="delete-modal-actions">
              <button
                className="delete-modal-cancel"
                onClick={() => setDeleteModalOpen(false)}
                data-testid="button-cancel-delete"
              >
                Cancel
              </button>
              <button
                className="delete-modal-confirm"
                onClick={() => {
                  if (!deletePassword.trim()) {
                    setDeleteError("Please enter your password");
                    return;
                  }
                  setDeleteError("Account deletion is not yet available");
                }}
                data-testid="button-confirm-delete"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
