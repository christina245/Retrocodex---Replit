import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { MapPin, House, Pencil, X, Home, Plus, Minus, XCircle, Search, Bookmark, Users, MapPinned, BellRing, FileText, MessageSquare, FilePenLine, CheckCircle, Check, BookOpen, ChevronRight, ChevronDown, Send, Newspaper, UserRoundPen, PenLine, Settings, LogOut, Shield, Bell, User, Trash2, Lock, CornerUpLeft, Heart, MessageSquareMore, UserRoundPlus, CircleCheckBig, CircleCheck, MapPinCheckInside, MonitorX, PlusCircle, Clock, MoreHorizontal, BellPlus, FlagTriangleRight, GitCommitHorizontal, MessageCircleMore, SearchCheck, Blend, CalendarCheck, ArrowUp, List } from "lucide-react";
import forwardArrow from "@assets/forward triangle red.png";
import scrungyConfetti from "@assets/Scrungy_the_squirrel_at_work_cropped_1774648658154.png";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SingleFactHeader } from "@/components/SingleFactHeader";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { FactCard } from "@/components/FactCard";
import type { Fact as FactCardFact } from "@/components/FactCard";
import type { Fact as DbFact, FeedItem, FactUpdateWithFact, UpdateType, FactWithCommentCount, ActivityFeedResponse, UnifiedNotification } from "@shared/schema";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { validateUsername } from "@/lib/usernameValidation";
import { AvatarPickerModal } from "@/components/AvatarPickerModal";
import { SourcesModal } from "@/components/SourcesModal";
import placeholderPhoto from "@assets/elementor-placeholder-image_1770884094599.png";
import { NotificationBell } from "@/components/NotificationBell";
import "../components/ExtendedFactCard.css";
import "../components/HomepageTabs.css";
import "../components/CommentsSection.css";
import "../components/SignInModal.css";
import "../components/SortSelector.css";
import { AdminBadge } from "@/components/AdminBadge";
import { TopicsModal } from "@/components/TopicsModal";
import BlogCard from "@/components/BlogCard";
import { getCategoryConfig } from "@shared/categories";
import { Button } from "@/components/ui/button";
import { getCountryFlag } from "@/lib/countryFlags";
import "./UserDashboard.css";

type DashboardTab = "for-you" | "following" | "local" | "fact-updates";
type SideTab = "feed" | "notifications" | "edit-profile" | "activity" | "edit-requests" | "saved" | "settings";
type ActivityTab = "submitted" | "approved" | "not-approved" | "comments";
type EditRequestsTab = "pending" | "approved" | "not-approved";
type ProfileActivityTab = "submissions" | "edits" | "comments";
type SavedTab = "facts" | "articles" | "comments";

const DASHBOARD_TABS: { id: DashboardTab; label: string; tooltip?: string }[] = [
  { id: "for-you", label: "For You", tooltip: "New topics and articles based on your interests." },
  { id: "following", label: "Following", tooltip: "Activity from users you follow." },
  { id: "local", label: "Local", tooltip: "Activity from users currently based in your current or past locations." },
  { id: "fact-updates", label: "Fact Updates", tooltip: "Updates from facts you follow." },
];

const PROFILE_ACTIVITY_TABS: { id: ProfileActivityTab; label: string }[] = [
  { id: "submissions", label: "Submissions" },
  { id: "edits", label: "Edits" },
  { id: "comments", label: "Comments" },
];

const ACTIVITY_TABS: { id: ActivityTab; label: string }[] = [
  { id: "submitted", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "not-approved", label: "Not Approved" },
  { id: "comments", label: "Comments" },
];

const SAVED_TABS: { id: SavedTab; label: string }[] = [
  { id: "facts", label: "Facts" },
  { id: "articles", label: "Articles" },
  { id: "comments", label: "Comments" },
];

const EDIT_REQUESTS_TABS: { id: EditRequestsTab; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "not-approved", label: "Not Approved" },
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


const PINNED_COUNTRIES = ["United States", "Canada"];

const ALL_COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua & Deps",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Cape Verde",
  "Central African Rep",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Congo {Democratic Rep}",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland {Republic}",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Korea North",
  "Korea South",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Macedonia",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar, {Burma}",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russian Federation",
  "Rwanda",
  "St Kitts & Nevis",
  "St Lucia",
  "Saint Vincent & the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome & Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Swaziland",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad & Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

const SAMPLE_US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
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

  const q = query.toLowerCase();
  const filteredPinned = PINNED_COUNTRIES.filter(c => c.toLowerCase().includes(q));
  const filteredMain = ALL_COUNTRIES.filter(c => c.toLowerCase().includes(q));
  const showDivider = filteredPinned.length > 0 && filteredMain.length > 0;
  const hasResults = filteredPinned.length > 0 || filteredMain.length > 0;

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
          {hasResults ? (
            <>
              {filteredPinned.map((country) => (
                <div
                  key={country}
                  className={`signin-country-option${value === country ? " signin-country-option-selected" : ""}`}
                  onClick={() => { onChange(country); setQuery(""); setIsOpen(false); }}
                  data-testid={`${testId}-option-${country.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {country}
                </div>
              ))}
              {showDivider && (
                <div style={{ height: 1, background: "#d1d5db", margin: "4px 8px" }} />
              )}
              {filteredMain.map((country) => (
                <div
                  key={country}
                  className={`signin-country-option${value === country ? " signin-country-option-selected" : ""}`}
                  onClick={() => { onChange(country); setQuery(""); setIsOpen(false); }}
                  data-testid={`${testId}-option-${country.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {country}
                </div>
              ))}
            </>
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

function getDiceBearUrlDashboard(username: string) {
  return `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(username)}&radius=8`;
}

function getAvatarSrcDashboard(avatarUrl: string, username: string) {
  if (avatarUrl && avatarUrl.trim() !== "") return avatarUrl;
  return getDiceBearUrlDashboard(username);
}

function formatRelativeTime(date: Date | string) {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface FeedPostHandlers {
  savedFactIds: Set<string>;
  onSaveFact: (id: string) => void;
  onUnsaveFact: (id: string) => void;
  onBetaClick: (slug: string) => void;
  onNavigate: (path: string) => void;
}

function feedItemToFactCard(item: FeedItem): FactCardFact {
  const rawCategory = item.factCategories?.[0] ?? "";
  const categoryName = rawCategory.toUpperCase();
  const catConfig = getCategoryConfig(categoryName);
  return {
    id: item.id,
    category: categoryName,
    categoryColor: catConfig?.color ?? "#2C2C2C",
    myth: item.mythHeader ?? "",
    truth: item.truthHeader ?? "",
    link: item.factSlug ? `/fact/${item.factSlug}` : undefined,
    coverPhoto: item.factCoverPhoto2 ?? undefined,
    betaOnly: item.factBetaOnly ?? false,
    factFilters: item.factFilters ?? [],
    revisionYear: item.factRevisionYear ?? undefined,
    taughtUntilYear: item.factTaughtUntilYear ?? undefined,
    commentCount: item.commentCount ?? 0,
  };
}

function FeedUserLocation({ item, index }: { item: FeedItem; index: number }) {
  const hasCurrentLoc = item.userShowCurrentLocation && item.userCurrentLocation;
  const hasPlaces = item.userShowPlacesLived && item.userPlacesLived && item.userPlacesLived.length > 0;
  if (!hasCurrentLoc && !hasPlaces) return null;
  return (
    <div className="comment-user-info" data-testid={`feed-user-location-${index}`}>
      {hasCurrentLoc && (
        <span className="user-info-item">
          <MapPin size={12} />
          <span>{item.userCurrentLocation}</span>
        </span>
      )}
      {hasPlaces && (
        <span className={`user-info-item${hasCurrentLoc ? " user-info-hometowns" : ""}`}>
          <House size={12} />
          {item.userPlacesLived!.map((place, i) => (
            <span key={i}>
              {place}
              {i < item.userPlacesLived!.length - 1 && <span className="info-separator">•</span>}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

function FeedPost({ item, index, handlers }: { item: FeedItem; index: number; handlers: FeedPostHandlers }) {
  const { savedFactIds, onSaveFact, onUnsaveFact, onBetaClick, onNavigate } = handlers;

  if (item.type === "fact") {
    const fact = feedItemToFactCard(item);
    const isSaved = savedFactIds.has(item.id);
    const hasAttribution = item.username && item.username !== "";
    const avatarSrc = hasAttribution ? getAvatarSrcDashboard(item.avatarUrl, item.username) : null;
    return (
      <div className="following-post following-post--fact" data-testid={`feed-post-${index}`}>
        {hasAttribution && (
          <div className="following-post-attribution">
            <img src={avatarSrc!} alt={item.username} className="following-post-avatar" />
            <div className="following-post-header">
              <div className="following-post-header-text">
                <Link href={`/user/${item.username}`} className="following-post-username" data-testid={`link-feed-user-${index}`}>
                  {item.username}
                </Link>
                <span className="following-post-action">submitted a topic</span>
              </div>
              <span className="following-post-timestamp">{formatRelativeTime(item.createdAt)}</span>
            </div>
          </div>
        )}
        <FeedUserLocation item={item} index={index} />
        <div className="following-post-fact-card-wrap">
          <FactCard
            fact={fact}
            isSaved={isSaved}
            onSave={() => isSaved ? onUnsaveFact(item.id) : onSaveFact(item.id)}
            onShare={() => {
              if (navigator.share) {
                navigator.share({ url: `${window.location.origin}/fact/${item.factSlug}` });
              } else {
                navigator.clipboard.writeText(`${window.location.origin}/fact/${item.factSlug}`);
              }
            }}
            onComment={() => onNavigate(`/fact/${item.factSlug}#comments`)}
            onBetaClick={onBetaClick}
            showTaughtUntilLabel
          />
        </div>
      </div>
    );
  }

  if (item.type === "article") {
    return (
      <div className="following-post following-post--article" data-testid={`feed-post-${index}`}>
        <div className="following-post-main">
          <a
            href={item.articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="feed-article-link"
            data-testid={`link-feed-article-${index}`}
          >
            <div className="feed-article-card" data-testid={`feed-article-${index}`}>
              <div className="feed-article-body">
                {item.publicationName && (
                  <span className="feed-article-publication" data-testid={`feed-article-pub-${index}`}>{item.publicationName}</span>
                )}
                <p className="feed-article-title" data-testid={`feed-article-title-${index}`}>{item.articleTitle}</p>
                {item.articleSummary && (
                  <p className="feed-article-summary" data-testid={`feed-article-summary-${index}`}>{item.articleSummary}</p>
                )}
              </div>
              {item.articleCoverImage && (
                <img src={item.articleCoverImage} alt="" className="feed-article-cover" />
              )}
            </div>
          </a>
        </div>
      </div>
    );
  }

  // comment type — with user attribution
  const avatarSrc = getAvatarSrcDashboard(item.avatarUrl, item.username);
  return (
    <div className="following-post" data-testid={`feed-post-${index}`}>
      <img src={avatarSrc} alt={item.username} className="following-post-avatar" />
      <div className="following-post-main">
        <div className="following-post-header">
          <div className="following-post-header-text">
            <Link href={`/user/${item.username}`} className="following-post-username" data-testid={`link-feed-user-${index}`}>
              {item.username}
            </Link>
            {item.type === "comment" && item.factTitle && (
              <>
                <span className="following-post-action">commented on</span>
                {item.factSlug ? (
                  <Link href={`/fact/${item.factSlug}`} className="following-post-action following-post-fact-link" data-testid={`link-feed-fact-${index}`}>
                    &ldquo;{item.factTitle}&rdquo;
                  </Link>
                ) : (
                  <span className="following-post-action">&ldquo;{item.factTitle}&rdquo;</span>
                )}
              </>
            )}
            {item.type === "comment" && !item.factTitle && (
              <span className="following-post-action">commented on a fact</span>
            )}
          </div>
          <span className="following-post-timestamp">{formatRelativeTime(item.createdAt)}</span>
        </div>
        <FeedUserLocation item={item} index={index} />
        <div className="following-post-body">
          {item.type === "comment" && (
            <div className="following-post-body-content" data-testid={`feed-comment-${index}`}>
              <div className="following-post-body-left">
                <p className="following-plain-comment" data-testid={`feed-comment-body-${index}`}>{item.commentBody}</p>
              </div>
              {item.factCoverPhoto && (
                <Link href={item.factSlug ? `/fact/${item.factSlug}` : "#"} className="following-post-cover-link">
                  <img src={item.factCoverPhoto} alt="" className="following-post-cover-photo" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const { user, isLoggedIn, isLoading: authLoading, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const initialTab = (() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["feed", "notifications", "edit-profile", "activity", "edit-requests", "saved", "settings"].includes(tab)) {
      return tab as SideTab;
    }
    return "feed" as SideTab;
  })();

  const verifiedParam = (() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("verified");
  })();
  const [showVerifiedModal, setShowVerifiedModal] = useState<"success" | "invalid" | "already" | null>(
    verifiedParam === "success" ? "success" : verifiedParam === "already" ? "already" : verifiedParam === "invalid" ? "invalid" : null
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showAllPlaces, setShowAllPlaces] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [editProfilePhoto, setEditProfilePhoto] = useState(user?.profilePhoto || "");
  const [feedTab, setFeedTab] = useState<DashboardTab>("for-you");
  const [localPage, setLocalPage] = useState(1);
  const [hoveredFeedTab, setHoveredFeedTab] = useState<DashboardTab | null>(null);
  const [sideTab, setSideTab] = useState<SideTab>(initialTab);
  const [notifPage, setNotifPage] = useState(1);
  const [activityTab, setActivityTab] = useState<ActivityTab>("submitted");
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);
  const [expandedDenials, setExpandedDenials] = useState<Record<string, boolean>>({});
  const [overflowingDenials, setOverflowingDenials] = useState<Record<string, boolean>>({});
  const denialTextRefs = useRef<Record<string, HTMLParagraphElement | null>>({});
  const [editRequestsTab, setEditRequestsTab] = useState<EditRequestsTab>("pending");
  const [profileActivityTab, setProfileActivityTab] = useState<ProfileActivityTab>("submissions");
  const [bioEditOpen, setBioEditOpen] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [allowFollows, setAllowFollows] = useState(() => user?.allowFollows ?? true);
  useEffect(() => { setAllowFollows(user?.allowFollows ?? true); }, [user?.allowFollows]);
  const [followedBackIds, setFollowedBackIds] = useState<Record<string, boolean>>({});
  const [publicProfile, setPublicProfile] = useState(true);
  const [notifyFollows, setNotifyFollows] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyFactUpdates, setNotifyFactUpdates] = useState(true);
  const [emailNotifyFollows, setEmailNotifyFollows] = useState(true);
  const [emailNotifyComments, setEmailNotifyComments] = useState(true);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [activeEllipsisId, setActiveEllipsisId] = useState<string | null>(null);
  const [savedTab, setSavedTab] = useState<SavedTab>("facts");
  const [savedArticlesSort, setSavedArticlesSort] = useState<"saved" | "posted">("saved");
  const [savedArticlesSortOpen, setSavedArticlesSortOpen] = useState(false);
  const savedArticlesSortRef = useRef<HTMLDivElement>(null);
  const [sourcesModalFactId, setSourcesModalFactId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("editProfile") === "true") {
      setSideTab("edit-profile");
      setEditModalOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!activeEllipsisId) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.comment-ellipsis-wrapper')) {
        setActiveEllipsisId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeEllipsisId]);

  useEffect(() => {
    if (!savedArticlesSortOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (savedArticlesSortRef.current && !savedArticlesSortRef.current.contains(e.target as Node)) {
        setSavedArticlesSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [savedArticlesSortOpen]);
  const queryClientHook = useQueryClient();
  const [activityLastSeenAt, setActivityLastSeenAt] = useState<string>(() => {
    try {
      return localStorage.getItem("activityLastSeenAt") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    } catch {
      return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  });
  useEffect(() => {
    if (sideTab === "notifications") {
      const now = new Date().toISOString();
      try { localStorage.setItem("activityLastSeenAt", now); } catch {}
      setActivityLastSeenAt(now);
      setNotifPage(1);
      queryClientHook.invalidateQueries({ queryKey: ["/api/notifications/count"] });
    }
  }, [sideTab]);
  const [emailNotifyFactUpdates, setEmailNotifyFactUpdates] = useState(true);
  const [topicsModalOpen, setTopicsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const { data: notifCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/count", activityLastSeenAt],
    queryFn: () => fetch(`/api/notifications/count?since=${encodeURIComponent(activityLastSeenAt)}`, { credentials: "include" }).then(r => r.json()),
    enabled: isLoggedIn,
    staleTime: 60_000,
  });
  const notificationCount = notifCountData?.count ?? 0;


  const allCountries = [...PINNED_COUNTRIES, ...ALL_COUNTRIES];
  const parseLocation = (loc: string) => {
    const parts = loc.split(", ");
    if (parts.length === 2 && allCountries.includes(parts[1])) {
      return { country: parts[1], usState: parts[1] === "United States" ? parts[0] : "" };
    }
    if (allCountries.includes(loc)) {
      return { country: loc, usState: "" };
    }
    return { country: loc, usState: "" };
  };

  const parsedCurrent = user ? parseLocation(user.currentLocation) : { country: "", usState: "" };

  const [editUsername, setEditUsername] = useState(user?.username || "");
  const [editUsernameError, setEditUsernameError] = useState<string | null>(null);
  const [editMisinfo, setEditMisinfo] = useState(user?.misinfoSource || "");
  const [editCurrentCountry, setEditCurrentCountry] = useState(parsedCurrent.country);
  const [editCurrentState, setEditCurrentState] = useState(parsedCurrent.usState);
  const [editShowCurrentLocation, setEditShowCurrentLocation] = useState(user?.showCurrentLocation || false);
  const [editPlacesLived, setEditPlacesLived] = useState<{ country: string; usState: string }[]>(
    (user?.placesLived && user.placesLived.length > 0)
      ? user.placesLived.map((p) => parseLocation(p))
      : [{ country: "", usState: "" }, { country: "", usState: "" }]
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

  const { data: followingFeed = [], isLoading: followingFeedLoading } = useQuery<FeedItem[]>({
    queryKey: ["/api/feed"],
    enabled: feedTab === "following",
  });

  const { data: forYouFeed = [], isLoading: forYouFeedLoading } = useQuery<FeedItem[]>({
    queryKey: ["/api/feed/for-you"],
    enabled: feedTab === "for-you",
  });

  const { data: factUpdatesFeed = [], isLoading: factUpdatesFeedLoading } = useQuery<FactUpdateWithFact[]>({
    queryKey: ["/api/feed/fact-updates"],
    enabled: feedTab === "fact-updates",
  });

  interface LocalFeedResponse {
    items: FeedItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
  const { data: localFeedData, isLoading: localFeedLoading } = useQuery<LocalFeedResponse>({
    queryKey: ["/api/feed/local", localPage],
    queryFn: () => fetch(`/api/feed/local?page=${localPage}`).then(r => r.json()),
    enabled: feedTab === "local" && isLoggedIn,
  });

  interface PublicProfileData { followerCount: number; followingCount: number; }
  const { data: myPublicProfile } = useQuery<PublicProfileData>({
    queryKey: ["/api/users", user?.username],
    queryFn: () => fetch(`/api/users/${user?.username}`).then((r) => r.json()),
    enabled: !!user?.username,
  });

  interface MySubmission {
    id: string;
    mythHeader: string;
    mythDetails: string;
    truthHeader: string;
    truthDetails: string;
    sources: string[];
    considerations: string;
    status: "pending" | "saved" | "rejected" | "published";
    adminNote: string | null;
    draftData: Record<string, any> | null;
    createdAt: string;
  }

  const { data: mySubmissions = [], isLoading: mySubmissionsLoading } = useQuery<MySubmission[]>({
    queryKey: ["/api/submissions/me"],
    enabled: isLoggedIn,
  });

  const { data: activityFeed, isLoading: activityFeedLoading } = useQuery<ActivityFeedResponse>({
    queryKey: ["/api/notifications/activity", notifPage],
    queryFn: () => fetch(`/api/notifications/activity?page=${notifPage}`, { credentials: "include" }).then(r => r.json()),
    enabled: isLoggedIn,
  });

  const { data: followingIds = [] } = useQuery<string[]>({
    queryKey: ["/api/following"],
    enabled: isLoggedIn,
  });
  useEffect(() => {
    if (followingIds.length > 0) {
      const map: Record<string, boolean> = {};
      followingIds.forEach((id: string) => { map[id] = true; });
      setFollowedBackIds(map);
    }
  }, [followingIds]);

  const [pendingFollowId, setPendingFollowId] = useState<string | null>(null);
  const followBackMutation = useMutation({
    mutationFn: (followerId: string) => {
      setPendingFollowId(followerId);
      return apiRequest("POST", `/api/follow/${followerId}`);
    },
    onSuccess: (_data: unknown, followerId: string) => {
      setFollowedBackIds(prev => ({ ...prev, [followerId]: true }));
      setPendingFollowId(null);
    },
    onError: () => setPendingFollowId(null),
  });

  interface MyCommentItem {
    id: string;
    body: string;
    createdAt: string;
    upvotes: number;
    isUpvotedByMe: boolean;
    factTitle: string;
    factSlug: string;
    factCoverPhoto: string | null;
  }

  const { data: myComments = [], isLoading: myCommentsLoading } = useQuery<MyCommentItem[]>({
    queryKey: ["/api/comments/me"],
    enabled: isLoggedIn,
  });

  const [dashboardEditingId, setDashboardEditingId] = useState<string | null>(null);
  const [dashboardEditBody, setDashboardEditBody] = useState("");

  const dashboardDeleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/comments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/comments/me"] }),
  });

  const dashboardEditMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      apiRequest("PATCH", `/api/comments/${id}`, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments/me"] });
      setDashboardEditingId(null);
    },
  });

  const dashboardUpvoteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/comments/${id}/upvote`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/comments/me"] }),
  });

  interface SavedArticleItem {
    id: string;
    articleKey: string;
    articleType: string;
    title: string;
    summary: string;
    coverImage: string;
    category: string;
    slug: string;
    externalUrl: string;
    publicationName: string | null;
    originalPublishedAt: string | null;
    publishedAt: string | null;
    savedAt: string;
  }

  const queryClient = useQueryClient();

  const { data: savedArticleItems = [], isLoading: savedArticlesLoading } = useQuery<SavedArticleItem[]>({
    queryKey: ["/api/user/saved-articles"],
    enabled: isLoggedIn,
  });

  const formatSavedArticleDate = (isoDate: string | null): string => {
    if (!isoDate) return '';
    const t = Date.parse(isoDate);
    if (!Number.isFinite(t)) return '';
    return new Date(t).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const sortedArticleItems = [...savedArticleItems].sort((a, b) => {
    if (savedArticlesSort === "posted") {
      const tA = Date.parse(a.publishedAt ?? '');
      const tB = Date.parse(b.publishedAt ?? '');
      const aDate = Number.isFinite(tA) ? tA : -Infinity;
      const bDate = Number.isFinite(tB) ? tB : -Infinity;
      return bDate - aDate;
    }
    return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
  });

  const { data: savedDbFacts = [], isLoading: savedFactsLoading } = useQuery<FactWithCommentCount[]>({
    queryKey: ["/api/user/saved-facts"],
    enabled: isLoggedIn,
  });

  const savedFactItems: FactCardFact[] = savedDbFacts.map((fact) => {
    const primaryCategory = fact.categories?.[0] || "Other";
    const categoryDisplay = (primaryCategory === "Other" && fact.subcategories?.[0])
      ? `OTHER • ${fact.subcategories[0].toUpperCase()}`
      : primaryCategory.toUpperCase();
    return {
      id: fact.id,
      category: categoryDisplay,
      categoryColor: getCategoryColor(fact.categories || []),
      myth: fact.mythHeader,
      truth: fact.truthHeader,
      dateAdded: fact.createdAt ? new Date(fact.createdAt).toISOString().split("T")[0] : undefined,
      link: `/fact/${fact.slug}`,
      coverPhoto: fact.coverPhoto || undefined,
      betaOnly: fact.betaOnly || false,
      factFilters: fact.factFilters || undefined,
      revisionYear: fact.revisionYear ?? undefined,
      taughtUntilYear: fact.taughtUntilYear ?? undefined,
      commentCount: fact.commentCount ?? 0,
    };
  });

  const saveFactMutation = useMutation({
    mutationFn: (factId: string) => apiRequest("POST", `/api/user/saved-facts`, { factId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/saved-facts"] });
    },
  });

  const unsaveFactMutation = useMutation({
    mutationFn: (factId: string) => apiRequest("DELETE", `/api/user/saved-facts/${factId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/saved-facts"] });
    },
  });

  interface SavedCommentItem {
    id: string;
    commentId: string;
    body: string;
    upvotes: number;
    commentCreatedAt: string;
    savedAt: string;
    factMythHeader: string;
    factSlug: string;
    factCoverPhoto: string | null;
    commenterUsername: string | null;
    commenterAvatarUrl: string | null;
  }

  const { data: savedCommentItems = [], isLoading: savedCommentsLoading } = useQuery<SavedCommentItem[]>({
    queryKey: ["/api/comments/saved"],
    enabled: isLoggedIn,
  });

  const unsaveCommentMutation = useMutation({
    mutationFn: (commentId: string) => apiRequest("DELETE", `/api/comments/${commentId}/save`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments/saved"] });
    },
  });

  const savedFactIdSet = new Set(savedDbFacts.map((f) => f.id));

  const feedHandlers: FeedPostHandlers = {
    savedFactIds: savedFactIdSet,
    onSaveFact: (id) => saveFactMutation.mutate(id),
    onUnsaveFact: (id) => unsaveFactMutation.mutate(id),
    onBetaClick: (slug) => setSourcesModalFactId(slug),
    onNavigate: (path) => navigate(path),
  };

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


  const handleFeedTabChange = useCallback((tab: DashboardTab) => {
    setFeedTab(tab);
    if (tab === "local") setLocalPage(1);
  }, []);

  const MAX_VISIBLE_TAGS = 5;
  const MAX_VISIBLE_PLACES = 2;
  const visibleTags = showAllTags
    ? (user?.favoriteTags ?? [])
    : (user?.favoriteTags ?? []).slice(0, MAX_VISIBLE_TAGS);
  const hasMoreTags = (user?.favoriteTags ?? []).length > MAX_VISIBLE_TAGS;
  const visiblePlaces = showAllPlaces
    ? (user?.placesLived ?? [])
    : (user?.placesLived ?? []).slice(0, MAX_VISIBLE_PLACES);
  const hasMorePlaces = (user?.placesLived ?? []).length > MAX_VISIBLE_PLACES;

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

  const pendingSubmissions = mySubmissions
    .filter(s => s.status === "pending" || s.status === "saved")
    .map(s => ({
      id: s.id,
      myth: s.mythHeader,
      truth: s.truthHeader,
      category: [] as string[],
      details: s.mythDetails,
      moreDetails: s.truthDetails,
      sources: s.sources as string[],
      submittedAt: new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: s.status,
    }));

  const approvedSubmissions = mySubmissions
    .filter(s => s.status === "published")
    .map(s => ({
      id: s.id,
      myth: s.mythHeader,
      truth: s.truthHeader,
      category: [] as string[],
      details: s.mythDetails,
      moreDetails: s.truthDetails,
      sources: s.sources,
      publishedAt: new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      slug: (s.draftData?.slug as string) || "",
    }));

  const rejectedSubmissions = mySubmissions
    .filter(s => s.status === "rejected")
    .map(s => ({
      id: s.id,
      myth: s.mythHeader,
      truth: s.truthHeader,
      category: [] as string[],
      details: s.mythDetails,
      sources: s.sources,
      submittedAt: new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      denialReason: s.adminNote || "",
    }));


  const SUBMISSIONS_PER_PAGE = 10;
  const totalSubmissionsPages = Math.ceil(pendingSubmissions.length / SUBMISSIONS_PER_PAGE);
  const paginatedSubmissions = pendingSubmissions.slice(
    (submissionsPage - 1) * SUBMISSIONS_PER_PAGE,
    submissionsPage * SUBMISSIONS_PER_PAGE
  );
  const totalApprovedPages = Math.ceil(approvedSubmissions.length / SUBMISSIONS_PER_PAGE);
  const paginatedApproved = approvedSubmissions.slice(
    (approvedPage - 1) * SUBMISSIONS_PER_PAGE,
    approvedPage * SUBMISSIONS_PER_PAGE
  );
  const totalRejectedPages = Math.ceil(rejectedSubmissions.length / SUBMISSIONS_PER_PAGE);
  const paginatedRejected = rejectedSubmissions.slice(
    (rejectedPage - 1) * SUBMISSIONS_PER_PAGE,
    rejectedPage * SUBMISSIONS_PER_PAGE
  );

  useEffect(() => {
    if (activityTab !== "not-approved") return;
    const measure = () => {
      const newOverflows: Record<string, boolean> = {};
      paginatedRejected.forEach((sub) => {
        const el = denialTextRefs.current[sub.id];
        if (el && !expandedDenials[sub.id]) {
          newOverflows[sub.id] = el.scrollHeight > el.clientHeight + 1;
        } else if (el && expandedDenials[sub.id]) {
          newOverflows[sub.id] = overflowingDenials[sub.id] ?? false;
        }
      });
      setOverflowingDenials(newOverflows);
    };
    requestAnimationFrame(measure);
  }, [activityTab, rejectedPage]);

  const toggleDenialExpand = useCallback((id: string) => {
    setExpandedDenials((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());

  type NotifTextContent = string;
  type NotifTimelineContent = { year: string; description: string };
  type NotifNuanceContent = { type: string; body: string };
  type NotifUpdateContent = NotifTextContent | NotifTimelineContent | NotifNuanceContent;

  const isNotifTimelineContent = (c: NotifUpdateContent): c is NotifTimelineContent =>
    typeof c === "object" && c !== null && "year" in c && "description" in c;

  const isNotifNuanceContent = (c: NotifUpdateContent): c is NotifNuanceContent =>
    typeof c === "object" && c !== null && "type" in c && "body" in c;

  const parseNotifContent = (raw: unknown): NotifUpdateContent => {
    if (typeof raw === "string") return raw;
    if (raw !== null && typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      if (typeof obj.year === "string" && typeof obj.description === "string") {
        return { year: obj.year, description: obj.description };
      }
      if (typeof obj.type === "string" && typeof obj.body === "string") {
        return { type: obj.type, body: obj.body };
      }
    }
    return String(raw ?? "");
  };

  const renderNotifUpdateEntry = (update: { id: string; updateType: string; content: unknown }) => {
    const content = parseNotifContent(update.content);
    if (update.updateType === "timelineEntry" && isNotifTimelineContent(content)) {
      return (
        <div key={update.id} className="mb-2">
          <p className="activity-submitted-label">Revision:</p>
          <div className="activity-submitted-revision">
            <GitCommitHorizontal size={16} className="activity-revision-icon activity-revision-timeline" />
            <div className="activity-timeline-revision">
              <p className="activity-timeline-year">{content.year}</p>
              <div className="activity-truth-text activity-truth-markdown"><ReactMarkdown>{content.description}</ReactMarkdown></div>
            </div>
          </div>
        </div>
      );
    }
    if (update.updateType === "nuanceEntry" && isNotifNuanceContent(content)) {
      return (
        <div key={update.id} className="mb-2">
          <p className="activity-submitted-label">Nuance added:</p>
          <div className="activity-submitted-revision">
            <Blend size={16} className="activity-revision-icon" />
            <div className="activity-timeline-revision">
              <p className="activity-timeline-year">{content.type}</p>
              <div className="activity-truth-text activity-truth-markdown"><ReactMarkdown>{content.body}</ReactMarkdown></div>
            </div>
          </div>
        </div>
      );
    }
    const text = typeof content === "string" ? content : String(content);
    return (
      <div key={update.id} className="mb-2">
        <p className="activity-submitted-label">Revision:</p>
        <div className="activity-submitted-revision">
          <Check size={16} className="activity-revision-check" />
          <div className="activity-truth-text activity-truth-markdown"><ReactMarkdown>{text}</ReactMarkdown></div>
        </div>
      </div>
    );
  };

  if (authLoading) return null;
  if (!isLoggedIn || !user) {
    navigate("/");
    return null;
  }

  return (
    <div className="user-dashboard" data-testid="user-dashboard">
      <SEO
        title={`${user.username} - Retrocodex`}
        description={`${user.username}'s profile on Retrocodex`}
      />
      <SingleFactHeader onMenuClick={() => setIsMenuOpen(!isMenuOpen)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {showVerifiedModal && (
        <div className="signin-overlay" data-testid="verified-success-modal">
          <div className="signin-modal" data-testid="verified-success-modal-inner">
            <button
              onClick={() => setShowVerifiedModal(null)}
              className="signin-close"
              data-testid="button-close-verified-modal"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="signin-modal-body">
              <div className="signin-email-verification">
                {showVerifiedModal === "success" && (
                  <>
                    <img
                      src={scrungyConfetti}
                      alt="Email verified!"
                      className="signin-logo-signup"
                      data-testid="img-verified-success"
                    />
                    <h2 className="signin-confirmation-title signin-verify-title" data-testid="text-verified-heading">
                      Email successfully verified.
                    </h2>
                    <p className="signin-verify-body" data-testid="text-verified-body">
                      Welcome aboard!
                    </p>
                  </>
                )}
                {showVerifiedModal === "already" && (
                  <>
                    <img
                      src={scrungyConfetti}
                      alt="Already verified"
                      className="signin-logo-signup"
                      data-testid="img-already-verified"
                    />
                    <h2 className="signin-confirmation-title signin-verify-title" data-testid="text-already-verified-heading">
                      Already verified
                    </h2>
                    <p className="signin-verify-body" data-testid="text-already-verified-body">
                      Your email is already verified. You're all set!
                    </p>
                  </>
                )}
                {showVerifiedModal === "invalid" && (
                  <>
                    <h2 className="signin-confirmation-title signin-verify-title" data-testid="text-invalid-link-heading">
                      Invalid or expired link
                    </h2>
                    <p className="signin-verify-body" data-testid="text-invalid-link-body">
                      This verification link has expired or is invalid. Please request a new one from your profile.
                    </p>
                  </>
                )}
                <button
                  type="button"
                  className="signin-submit-button"
                  onClick={() => setShowVerifiedModal(null)}
                  data-testid="button-dismiss-verified-modal"
                  style={{ marginTop: "0.5rem" }}
                >
                  Keep Unlearning
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <span>My Profile</span>
              </button>
              <button
                className={`dashboard-side-tab${sideTab === "activity" ? " dashboard-side-tab-active" : ""}`}
                onClick={() => setSideTab("activity")}
                data-testid="button-side-tab-activity"
              >
                <Send size={20} className="dashboard-side-tab-icon" />
                <span>Submissions</span>
              </button>
              <button
                className={`dashboard-side-tab${sideTab === "edit-requests" ? " dashboard-side-tab-active" : ""}`}
                onClick={() => setSideTab("edit-requests")}
                data-testid="button-side-tab-edit-requests"
              >
                <PenLine size={20} className="dashboard-side-tab-icon" />
                <span>Edit Requests</span>
              </button>
              <button
                className={`dashboard-side-tab${sideTab === "saved" ? " dashboard-side-tab-active" : ""}`}
                onClick={() => setSideTab("saved")}
                data-testid="button-side-tab-saved"
              >
                <Bookmark size={20} className="dashboard-side-tab-icon" />
                <span>Saved</span>
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
                          onMouseEnter={() => tab.tooltip ? setHoveredFeedTab(tab.id) : undefined}
                          onMouseLeave={() => setHoveredFeedTab(null)}
                          data-testid={`button-feed-tab-${tab.id}`}
                        >
                          <span>{tab.label}</span>
                          {tab.tooltip && hoveredFeedTab === tab.id && (
                            <div className="homepage-tab-tooltip" data-testid={`tooltip-feed-tab-${tab.id}`}>
                              {tab.tooltip}
                            </div>
                          )}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="dashboard-feed-content" data-testid="dashboard-feed-content">
                    {feedTab === "for-you" && (
                      !isLoggedIn ? (
                        <div className="dashboard-feed-empty" data-testid="feed-empty-for-you-logged-out">
                          <Search size={40} className="dashboard-feed-empty-icon" />
                          <p className="dashboard-feed-empty-desc">Sign in to personalize your For You feed.</p>
                        </div>
                      ) : forYouFeedLoading ? (
                        <div className="dashboard-feed-empty" data-testid="feed-loading-for-you">
                          <p className="dashboard-feed-empty-desc">Loading activity...</p>
                        </div>
                      ) : forYouFeed.length > 0 ? (
                        <div className="feed-for-you-grid" data-testid="feed-for-you">
                          {forYouFeed.map((item, i) => (
                            <FeedPost key={`${item.type}-${item.id}`} item={item} index={i} handlers={feedHandlers} />
                          ))}
                        </div>
                      ) : (user?.favoriteTags?.length ?? 0) === 0 ? (
                        <div className="dashboard-feed-empty" data-testid="feed-empty-for-you-no-tags">
                          <Search size={40} className="dashboard-feed-empty-icon" />
                          <p className="dashboard-feed-empty-desc feed-empty-add-topics">
                            <button
                              type="button"
                              className="feed-add-topics-link"
                              onClick={() => setTopicsModalOpen(true)}
                              data-testid="button-add-topics"
                            >
                              Add topics
                            </button>
                            {" "}to view all related content.
                          </p>
                        </div>
                      ) : (
                        <div className="dashboard-feed-empty" data-testid="feed-empty-for-you">
                          <Search size={40} className="dashboard-feed-empty-icon" />
                          <p className="dashboard-feed-empty-desc">No matching content yet.</p>
                        </div>
                      )
                    )}

                    {feedTab === "following" && (
                      followingFeedLoading ? (
                        <div className="dashboard-feed-empty" data-testid="feed-loading-following">
                          <p className="dashboard-feed-empty-desc">Loading your feed...</p>
                        </div>
                      ) : followingFeed.length > 0 ? (
                        <div className="following-feed" data-testid="feed-following">
                          {followingFeed.map((item, i) => (
                            <FeedPost key={`${item.type}-${item.id}`} item={item} index={i} handlers={feedHandlers} />
                          ))}
                        </div>
                      ) : (
                        <div className="dashboard-feed-empty" data-testid="feed-empty-following">
                          <Users size={40} className="dashboard-feed-empty-icon" />
                          <p className="dashboard-feed-empty-title">No activity yet</p>
                          <p className="dashboard-feed-empty-desc">
                            Follow users to see their topic submissions and comments here.
                          </p>
                        </div>
                      )
                    )}

                    {feedTab === "local" && (
                      (() => {
                        const hasNoLocations = !user?.currentLocation && (!user?.placesLived || user.placesLived.length === 0);
                        const localItems = localFeedData?.items ?? [];
                        const localTotalPages = localFeedData?.totalPages ?? 1;

                        if (hasNoLocations) {
                          return (
                            <div className="dashboard-feed-empty" data-testid="feed-empty-local-no-location">
                              <MapPin size={40} className="dashboard-feed-empty-icon" />
                              <p className="dashboard-feed-empty-title">No location set</p>
                              <p className="dashboard-feed-empty-desc">
                                Add your current location or places you've lived in{" "}
                                <button
                                  type="button"
                                  className="feed-add-topics-link"
                                  onClick={() => setSideTab("settings")}
                                  data-testid="button-go-to-settings-local"
                                >
                                  Settings
                                </button>{" "}
                                to see activity from nearby users.
                              </p>
                            </div>
                          );
                        }

                        if (localFeedLoading) {
                          return (
                            <div className="dashboard-feed-empty" data-testid="feed-loading-local">
                              <p className="dashboard-feed-empty-desc">Loading local activity...</p>
                            </div>
                          );
                        }

                        if (localItems.length === 0) {
                          return (
                            <div className="edit-requests-beta-state" data-testid="feed-empty-local">
                              <img src={scrungyConfetti} alt="Scrungy the squirrel" className="edit-requests-beta-squirrel" />
                              <p className="edit-requests-beta-text">There aren't any other users from your location yet. Scrungy's working on reaching out to them!</p>
                            </div>
                          );
                        }

                        return (
                          <div className="following-feed" data-testid="feed-local">
                            <p className="local-feed-description" data-testid="local-feed-description">
                              Activity from users who share a location with you — current or past.
                            </p>
                            {localItems.map((item, i) => (
                              <FeedPost key={`${item.type}-${item.id}`} item={item} index={i} handlers={feedHandlers} />
                            ))}
                            {localTotalPages > 1 && (
                              <div className="feed-pagination" data-testid="local-feed-pagination">
                                <button
                                  className="feed-pagination-btn"
                                  onClick={() => setLocalPage(p => Math.max(1, p - 1))}
                                  disabled={localPage === 1}
                                  data-testid="button-local-prev"
                                >
                                  Previous
                                </button>
                                <span className="feed-pagination-info" data-testid="local-pagination-info">
                                  Page {localPage} of {localTotalPages}
                                </span>
                                <button
                                  className="feed-pagination-btn"
                                  onClick={() => setLocalPage(p => Math.min(localTotalPages, p + 1))}
                                  disabled={localPage === localTotalPages}
                                  data-testid="button-local-next"
                                >
                                  Next
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()
                    )}

                    {feedTab === "fact-updates" && (() => {
                      if (factUpdatesFeedLoading) {
                        return (
                          <div className="following-feed" data-testid="feed-fact-updates">
                            <div className="dashboard-feed-empty">
                              <p className="dashboard-feed-empty-desc">Loading updates...</p>
                            </div>
                          </div>
                        );
                      }

                      if (factUpdatesFeed.length === 0) {
                        return (
                          <div className="following-feed" data-testid="feed-fact-updates">
                            <div className="dashboard-feed-empty" data-testid="fact-updates-empty">
                              <BellRing size={32} strokeWidth={1.5} className="dashboard-feed-empty-icon" />
                              <p className="dashboard-feed-empty-title">No updates yet</p>
                              <p className="dashboard-feed-empty-desc">Follow topics on their fact pages to get notified when they're updated.</p>
                            </div>
                          </div>
                        );
                      }

                      // Group by publishBatchId, keep order by first occurrence
                      const batchMap = new Map<string, FactUpdateWithFact[]>();
                      for (const update of factUpdatesFeed) {
                        const arr = batchMap.get(update.publishBatchId) ?? [];
                        arr.push(update);
                        batchMap.set(update.publishBatchId, arr);
                      }
                      const batches = Array.from(batchMap.values());

                      type TextContent = string;
                      type TimelineContent = { year: string; description: string };
                      type NuanceContent = { type: string; body: string };
                      type UpdateContent = TextContent | TimelineContent | NuanceContent;

                      const isTimelineContent = (c: UpdateContent): c is TimelineContent =>
                        typeof c === "object" && c !== null && "year" in c && "description" in c;

                      const isNuanceContent = (c: UpdateContent): c is NuanceContent =>
                        typeof c === "object" && c !== null && "type" in c && "body" in c;

                      const parseContent = (update: FactUpdateWithFact): UpdateContent => {
                        const raw = update.content;
                        if (typeof raw === "string") return raw;
                        if (raw !== null && typeof raw === "object") {
                          const obj = raw as Record<string, unknown>;
                          if (typeof obj.year === "string" && typeof obj.description === "string") {
                            return { year: obj.year, description: obj.description };
                          }
                          if (typeof obj.type === "string" && typeof obj.body === "string") {
                            return { type: obj.type, body: obj.body };
                          }
                        }
                        return String(raw ?? "");
                      };

                      const formatRelativeTime = (date: string | Date) => {
                        const d = new Date(date).getTime();
                        const now = Date.now();
                        const diff = now - d;
                        const minutes = Math.floor(diff / 60000);
                        if (minutes < 60) return `${minutes}m ago`;
                        const hours = Math.floor(minutes / 60);
                        if (hours < 24) return `${hours}h ago`;
                        const days = Math.floor(hours / 24);
                        if (days < 7) return `${days}d ago`;
                        return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      };

                      const renderUpdateEntry = (update: FactUpdateWithFact) => {
                        const content = parseContent(update);
                        if (update.updateType === "timelineEntry" && isTimelineContent(content)) {
                          return (
                            <div key={update.id} className="mb-2">
                              <p className="activity-submitted-label">Revision:</p>
                              <div className="activity-submitted-revision">
                                <GitCommitHorizontal size={16} className="activity-revision-icon activity-revision-timeline" />
                                <div className="activity-timeline-revision">
                                  <p className="activity-timeline-year">{content.year}</p>
                                  <div className="activity-truth-text activity-truth-markdown"><ReactMarkdown>{content.description}</ReactMarkdown></div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        if (update.updateType === "nuanceEntry" && isNuanceContent(content)) {
                          return (
                            <div key={update.id} className="mb-2">
                              <p className="activity-submitted-label">Nuance added:</p>
                              <div className="activity-submitted-revision">
                                <Blend size={16} className="activity-revision-icon" />
                                <div className="activity-timeline-revision">
                                  <p className="activity-timeline-year">{content.type}</p>
                                  <div className="activity-truth-text activity-truth-markdown"><ReactMarkdown>{content.body}</ReactMarkdown></div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        // Text revision (mythHeader, mythDetails, truthHeader, truthDetails)
                        const text = typeof content === "string" ? content : String(content);
                        return (
                          <div key={update.id} className="mb-2">
                            <p className="activity-submitted-label">Revision:</p>
                            <div className="activity-submitted-revision">
                              <Check size={16} className="activity-revision-check" />
                              <div className="activity-truth-text activity-truth-markdown"><ReactMarkdown>{text}</ReactMarkdown></div>
                            </div>
                          </div>
                        );
                      };

                      return (
                        <div className="following-feed" data-testid="feed-fact-updates">
                          {batches.map((batch, batchIdx) => {
                            const first = batch[0];
                            const factPath = `/fact/${first.factSlug}`;
                            const timestamp = formatRelativeTime(first.publishedAt);
                            return (
                              <div className="activity-post" key={first.publishBatchId} data-testid={`fact-update-post-${batchIdx + 1}`}>
                                <div className="activity-post-icon-col">
                                  <PlusCircle size={40} strokeWidth={1.5} className="activity-status-icon activity-status-update" />
                                </div>
                                <div className="activity-post-main">
                                  <div className="activity-post-header">
                                    <div className="activity-post-header-text">
                                      <Link href={factPath} className="following-post-link">
                                        <p className="fact-myth">"{first.factMythHeader}"</p>
                                      </Link>
                                    </div>
                                    <span className="following-post-timestamp">{timestamp}</span>
                                  </div>
                                  <div className="activity-post-body">
                                    <div className="following-post-body-content">
                                      <div className="following-post-body-left">
                                        {batch.map((update) => renderUpdateEntry(update))}
                                      </div>
                                      {first.factCoverPhoto && (
                                        <Link href={factPath} className="following-post-cover-link" data-testid={`cover-link-fact-update-${batchIdx + 1}`}>
                                          <img src={first.factCoverPhoto} alt="" className="following-post-cover-photo" />
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                  </div>
                </>
              )}

              {sideTab === "notifications" && (
                  <div className="notifications-page" data-testid="notifications-page">
                    {activityFeedLoading ? (
                      <p className="saved-empty-message" data-testid="text-activity-loading">Loading activity...</p>
                    ) : !activityFeed || activityFeed.items.length === 0 ? (
                      <div className="dashboard-feed-empty" data-testid="activity-empty">
                        <BellRing size={40} strokeWidth={1.5} className="dashboard-feed-empty-icon" />
                        <p className="dashboard-feed-empty-title">No notifications yet.</p>
                        <p className="dashboard-feed-empty-desc">When others comment on your submissions, reply to your comments, follow you, or a fact you follow is updated, you'll see it here.</p>
                      </div>
                    ) : (
                      <div className="following-feed" data-testid="activity-feed-all">
                        {activityFeed.items.map((item: UnifiedNotification, idx: number) => {
                          const timeAgo = (() => {
                            const diff = Date.now() - new Date(item.timestamp).getTime();
                            const m = Math.floor(diff / 60000);
                            if (m < 1) return "just now";
                            if (m < 60) return `${m} min ago`;
                            const h = Math.floor(m / 60);
                            if (h < 24) return `${h}h ago`;
                            const d = Math.floor(h / 24);
                            if (d < 30) return `${d}d ago`;
                            return new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                          })();

                          if (item.type === "submission_reviewing") {
                            return (
                              <div key={`sr-${item.id}-${idx}`} className="activity-post" data-testid={`notif-under-review-${item.id}`}>
                                <div className="activity-post-icon-col">
                                  <SearchCheck size={40} strokeWidth={1.5} className="activity-status-icon" style={{ color: "#878787" }} />
                                </div>
                                <div className="activity-post-main">
                                  <div className="activity-post-header">
                                    <div className="activity-post-header-text">
                                      <span className="activity-status-text" style={{ color: "#555" }}>Your submission is currently under review!</span>
                                    </div>
                                    <span className="following-post-timestamp">{timeAgo}</span>
                                  </div>
                                  <div className="activity-post-body">
                                    <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>We'll email you when we've made our edits and additions.</p>
                                    <p className="activity-submitted-label">You submitted:</p>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem", marginBottom: "0.3rem" }}>
                                      <X size={13} style={{ color: "#e53e3e", flexShrink: 0, marginTop: "3px" }} />
                                      <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }} data-testid={`notif-myth-${item.id}`}>"{item.mythHeader}"</p>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                                      <Check size={13} style={{ color: "#38a169", flexShrink: 0, marginTop: "3px" }} />
                                      <p style={{ margin: 0, fontSize: "0.9rem" }} data-testid={`notif-truth-${item.id}`}>{item.truthHeader}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          if (item.type === "submission_published") {
                            return (
                              <div key={`sp-${item.id}-${idx}`} className="activity-post" data-testid={`notif-published-${item.id}`}>
                                <div className="activity-post-icon-col">
                                  <CircleCheckBig size={40} strokeWidth={1.5} className="activity-status-icon activity-status-approved" />
                                </div>
                                <div className="activity-post-main">
                                  <div className="activity-post-header">
                                    <div className="activity-post-header-text">
                                      <span className="activity-status-text activity-status-text-approved">Your submission has been published!</span>
                                    </div>
                                    <span className="following-post-timestamp">{timeAgo}</span>
                                  </div>
                                  <div className="activity-post-body">
                                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }} data-testid={`notif-myth-${item.id}`}>"{item.mythHeader}"</p>
                                    {item.publishedFactSlug && (
                                      <div className="activity-action-row" style={{ marginTop: "0.5rem" }}>
                                        <Link href={`/fact/${item.publishedFactSlug}`} className="activity-learn-more-button" data-testid={`button-view-published-${item.id}`}>
                                          <img src={forwardArrow} alt="" className="activity-learn-more-arrow" />
                                          View published fact
                                        </Link>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          if (item.type === "submission_rejected") {
                            return (
                              <div key={`srej-${item.id}-${idx}`} className="activity-post" data-testid={`notif-rejected-${item.id}`}>
                                <div className="activity-post-icon-col">
                                  <MonitorX size={40} strokeWidth={1.5} className="activity-status-icon activity-status-denied" />
                                </div>
                                <div className="activity-post-main">
                                  <div className="activity-post-header">
                                    <div className="activity-post-header-text">
                                      <span className="activity-status-text activity-status-text-denied">Your post submission was not approved.</span>
                                    </div>
                                    <span className="following-post-timestamp">{timeAgo}</span>
                                  </div>
                                  <div className="activity-post-body">
                                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }} data-testid={`notif-myth-${item.id}`}>"{item.mythHeader}"</p>
                                    {item.adminNote && (
                                      <div className="activity-admin-feedback" data-testid={`notif-admin-note-${item.id}`}>
                                        <p className="activity-admin-feedback-text">{item.adminNote}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          if (item.type === "comment") {
                            return (
                              <div key={`c-${item.commentId}-${idx}`} className="activity-post" data-testid={`notif-comment-${item.commentId}`}>
                                <div className="activity-post-icon-col">
                                  <img
                                    src={item.commenterAvatarUrl || placeholderPhoto}
                                    alt={item.commenterUsername || "User"}
                                    className="activity-post-avatar"
                                  />
                                  <MessageSquareMore size={20} className="activity-type-icon activity-type-comment" />
                                </div>
                                <div className="activity-post-main">
                                  <div className="activity-post-header">
                                    <div className="activity-post-header-text">
                                      {item.commenterUsername ? (
                                        <Link href={`/user/${item.commenterUsername}`} className="following-post-username" data-testid={`link-user-comment-${item.commentId}`}>{item.commenterUsername}</Link>
                                      ) : (
                                        <span className="following-post-username">[deleted]</span>
                                      )}
                                      <span className="following-post-action">commented on your submission</span>
                                    </div>
                                    <span className="following-post-timestamp" data-testid={`notif-comment-time-${item.commentId}`}>{timeAgo}</span>
                                  </div>
                                  <div className="activity-post-body">
                                    <div className="following-post-body-content">
                                      <div className="following-post-body-left">
                                        <Link href={`/fact/${item.factSlug}`} className="following-post-link" data-testid={`link-comment-fact-${item.commentId}`}>
                                          <p className="fact-myth">"{item.factMythHeader}"</p>
                                        </Link>
                                        <p className="following-plain-comment" data-testid={`comment-text-${item.commentId}`}>{item.body}</p>
                                      </div>
                                      {item.factCoverPhoto && (
                                        <Link href={`/fact/${item.factSlug}`} className="following-post-cover-link" data-testid={`cover-link-comment-${item.commentId}`}>
                                          <img src={item.factCoverPhoto} alt="" className="following-post-cover-photo" />
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          if (item.type === "reply") {
                            return (
                              <div key={`r-${item.replyId}-${idx}`} className="activity-post" data-testid={`notif-reply-${item.replyId}`}>
                                <div className="activity-post-icon-col">
                                  <img
                                    src={item.replierAvatarUrl || placeholderPhoto}
                                    alt={item.replierUsername || "User"}
                                    className="activity-post-avatar"
                                  />
                                  <MessageSquareMore size={20} className="activity-type-icon activity-type-comment" />
                                </div>
                                <div className="activity-post-main">
                                  <div className="activity-post-header">
                                    <div className="activity-post-header-text">
                                      {item.replierUsername ? (
                                        <Link href={`/user/${item.replierUsername}`} className="following-post-username" data-testid={`link-user-reply-${item.replyId}`}>{item.replierUsername}</Link>
                                      ) : (
                                        <span className="following-post-username">[deleted]</span>
                                      )}
                                      <span className="following-post-action">replied to your comment on</span>
                                    </div>
                                    <span className="following-post-timestamp" data-testid={`notif-reply-time-${item.replyId}`}>{timeAgo}</span>
                                  </div>
                                  <div className="activity-post-body">
                                    <div className="following-post-body-content">
                                      <div className="following-post-body-left">
                                        <Link href={`/fact/${item.factSlug}`} className="following-post-link" data-testid={`link-reply-fact-${item.replyId}`}>
                                          <p className="fact-myth">"{item.factMythHeader}"</p>
                                        </Link>
                                        <div className="activity-comment-thread">
                                          <div className="activity-thread-comment">
                                            <div className="activity-thread-author">
                                              <span className="activity-thread-username">{user?.username || "You"}</span>
                                            </div>
                                            <div className="following-comment-quote">
                                              <p className="following-comment-text" data-testid={`reply-parent-body-${item.replyId}`}>{item.parentBody}</p>
                                            </div>
                                          </div>
                                          <div className="activity-thread-comment">
                                            <div className="activity-thread-author">
                                              <span className="activity-thread-username">{item.replierUsername || "[deleted]"}</span>
                                            </div>
                                            <p className="following-plain-comment" data-testid={`reply-body-${item.replyId}`}>{item.replyBody}</p>
                                          </div>
                                        </div>
                                      </div>
                                      {item.factCoverPhoto && (
                                        <Link href={`/fact/${item.factSlug}`} className="following-post-cover-link" data-testid={`cover-link-reply-${item.replyId}`}>
                                          <img src={item.factCoverPhoto} alt="" className="following-post-cover-photo" />
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          if (item.type === "fact_update") {
                            const isExpanded = expandedBatches.has(item.publishBatchId);
                            const visibleUpdates = isExpanded ? item.updates : item.updates.slice(0, 1);
                            const hasMore = item.updates.length > 1;
                            return (
                              <div key={`fu-${item.publishBatchId}-${idx}`} className="activity-post" data-testid={`notif-fact-update-${item.publishBatchId}`}>
                                <div className="activity-post-icon-col">
                                  <PlusCircle size={40} strokeWidth={1.5} className="activity-status-icon activity-status-update" />
                                </div>
                                <div className="activity-post-main">
                                  <div className="activity-post-header">
                                    <div className="activity-post-header-text">
                                      <span className="activity-status-text">An update was posted to a fact you follow</span>
                                    </div>
                                    <span className="following-post-timestamp">{timeAgo}</span>
                                  </div>
                                  <div className="activity-post-body">
                                    <div className="following-post-body-content">
                                      <div className="following-post-body-left">
                                        <Link href={`/fact/${item.factSlug}`} className="following-post-link" data-testid={`link-fact-update-${item.publishBatchId}`}>
                                          <p className="fact-myth">"{item.factMythHeader}"</p>
                                        </Link>
                                        {visibleUpdates.map((u) => renderNotifUpdateEntry(u))}
                                        {hasMore && (
                                          <button
                                            className="notif-view-more-toggle"
                                            onClick={() => setExpandedBatches(prev => {
                                              const next = new Set(prev);
                                              if (next.has(item.publishBatchId)) next.delete(item.publishBatchId);
                                              else next.add(item.publishBatchId);
                                              return next;
                                            })}
                                            data-testid={`button-view-more-${item.publishBatchId}`}
                                          >
                                            {isExpanded ? "View Less" : `View More (${item.updates.length - 1} more)`}
                                          </button>
                                        )}
                                      </div>
                                      {item.factCoverPhoto && (
                                        <Link href={`/fact/${item.factSlug}`} className="following-post-cover-link" data-testid={`cover-link-fact-update-${item.publishBatchId}`}>
                                          <img src={item.factCoverPhoto} alt="" className="following-post-cover-photo" />
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          if (item.type === "new_follower") {
                            const alreadyFollowedBack = followedBackIds[item.followerId] || false;
                            return (
                              <div key={`nf-${item.followerId}-${idx}`} className="activity-post" data-testid={`notif-follower-${item.followerId}`}>
                                <div className="activity-post-icon-col">
                                  <img
                                    src={item.followerAvatarUrl || placeholderPhoto}
                                    alt={item.followerUsername || "User"}
                                    className="activity-post-avatar"
                                  />
                                  <UserRoundPlus size={20} className="activity-type-icon activity-type-follow" />
                                </div>
                                <div className="activity-post-main">
                                  <div className="activity-post-header">
                                    <div className="activity-post-header-text">
                                      {item.followerUsername ? (
                                        <Link href={`/user/${item.followerUsername}`} className="following-post-username" data-testid={`link-user-follower-${item.followerId}`}>{item.followerUsername}</Link>
                                      ) : (
                                        <span className="following-post-username">[deleted]</span>
                                      )}
                                      <span className="following-post-action">started following you</span>
                                    </div>
                                    <span className="following-post-timestamp">{timeAgo}</span>
                                  </div>
                                  <div className="activity-post-body">
                                    <button
                                      className={`activity-follow-button${alreadyFollowedBack ? " activity-follow-button-following" : ""}`}
                                      onClick={() => { if (!alreadyFollowedBack) followBackMutation.mutate(item.followerId); }}
                                      disabled={pendingFollowId === item.followerId}
                                      data-testid={`button-follow-back-${item.followerId}`}
                                    >
                                      {alreadyFollowedBack ? "Following" : "Follow back"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return null;
                        })}
                      </div>
                    )}

                    {activityFeed && activityFeed.totalPages > 1 && (
                      <div className="submissions-pagination" data-testid="activity-pagination">
                        <button
                          className="submissions-page-button"
                          disabled={notifPage === 1}
                          onClick={() => setNotifPage(notifPage - 1)}
                          data-testid="button-activity-prev"
                        >
                          Previous
                        </button>
                        <span className="submissions-page-info" data-testid="activity-page-info">
                          Page {notifPage} of {activityFeed.totalPages}
                        </span>
                        <button
                          className="submissions-page-button"
                          disabled={notifPage === activityFeed.totalPages}
                          onClick={() => setNotifPage(notifPage + 1)}
                          data-testid="button-activity-next"
                        >
                          Next
                        </button>
                      </div>
                    )}

                  </div>
                )}

                {sideTab === "edit-profile" && (
                <>
                <div className="dashboard-profile-banner" data-testid="dashboard-profile-banner">
                  <div className="user-profile-banner">
                    <a href={`/user/${user.username}`} target="_blank" rel="noopener noreferrer" className="profile-banner-primary-btn profile-banner-corner-btn" data-testid="link-view-public-profile">
                      View public profile
                    </a>
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
                          {user.isAdmin && <AdminBadge className="ml-2" />}
                        </h2>
                        <button
                          className="user-profile-edit-button"
                          onClick={() => {
                            const parsed = parseLocation(user?.currentLocation || "");
                            setEditUsername(user?.username || "");
                            setEditMisinfo(user?.misinfoSource || "");
                            setEditProfilePhoto(user?.profilePhoto || "");
                            setEditCurrentCountry(parsed.country);
                            setEditCurrentState(parsed.usState);
                            setEditShowCurrentLocation(user?.showCurrentLocation || false);
                            setEditPlacesLived((user?.placesLived && user.placesLived.length > 0) ? user.placesLived.map((p) => parseLocation(p)) : [{ country: "", usState: "" }, { country: "", usState: "" }]);
                            setEditShowPlacesLived(user?.showPlacesLived || false);
                            setEditTags(user?.favoriteTags || []);
                            setEditModalOpen(true);
                          }}
                          aria-label="Edit profile"
                          data-testid="button-edit-profile"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>

                      {myPublicProfile && (
                        <div className="user-profile-follow-counts" data-testid="dashboard-follow-counts">
                          <span data-testid="text-dashboard-follower-count">
                            <strong>{myPublicProfile.followerCount}</strong>{" "}
                            {myPublicProfile.followerCount === 1 ? "follower" : "followers"}
                          </span>
                          <span className="user-profile-follow-sep">·</span>
                          <span data-testid="text-dashboard-following-count">
                            <strong>{myPublicProfile.followingCount}</strong> following
                          </span>
                        </div>
                      )}

                      <div className="user-profile-locations-wrapper" data-testid="user-profile-locations">
                        <div className="user-profile-current-location">
                          {user.currentLocation ? (() => {
                            const flag = getCountryFlag(user.currentLocation);
                            return (
                              <span className="user-profile-location-item" data-testid="text-current-location">
                                <MapPin size={14} />
                                {flag && <span className="location-flag" aria-hidden="true">{flag}</span>}
                                {user.currentLocation}
                              </span>
                            );
                          })() : (
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
                                  {(() => { const f = getCountryFlag(loc); return f ? <span className="location-flag" aria-hidden="true">{f}</span> : null; })()}
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
                    <h3 className="user-profile-section-label">ABOUT</h3>
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
                        disabled={isSavingBio}
                        onClick={async () => {
                          setIsSavingBio(true);
                          await updateUser({ bio: editBio });
                          setIsSavingBio(false);
                          setBioEditOpen(false);
                        }}
                        data-testid="button-save-bio"
                      >
                        {isSavingBio ? "Saving…" : "Save Bio"}
                      </button>
                    </div>
                  </div>
                )}

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
                          onClick={() => { setActivityTab(tab.id); setSubmissionsPage(1); setApprovedPage(1); setRejectedPage(1); }}
                          data-testid={`button-activity-tab-${tab.id}`}
                        >
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="dashboard-feed-content" data-testid="dashboard-activity-content">
                    {activityTab === "submitted" && (
                      <div className="submissions-section" data-testid="activity-submissions">
                        <div className="submissions-grid" data-testid="submissions-grid">
                          {mySubmissionsLoading ? (
                            <>
                              {[1, 2].map((i) => (
                                <div key={i} className="submission-skeleton-card" data-testid={`submission-skeleton-${i}`}>
                                  <div className="submission-skeleton-body" />
                                  <div className="submission-skeleton-footer" />
                                </div>
                              ))}
                            </>
                          ) : paginatedSubmissions.length === 0 ? (
                            <div className="submissions-empty" data-testid="submissions-empty">No submissions currently pending</div>
                          ) : paginatedSubmissions.map((sub) => (
                            <div key={sub.id} className="submission-card-wrapper" data-testid={`submission-card-${sub.id}`}>
                              {sub.status === "saved" ? (
                                <div className="extended-fact-card under-review-card">
                                  <div className="extended-fact-content">
                                    <div className="under-review-header">
                                      <SearchCheck size={24} style={{ color: "#878787", flexShrink: 0 }} />
                                      <div>
                                        <p className="under-review-heading">Your submission is currently under review!</p>
                                        <p className="under-review-body">We'll email you when we've made our edits and additions.</p>
                                      </div>
                                    </div>
                                    <div className="under-review-submitted-label">You submitted:</div>
                                    <div className="fact-section">
                                      <div className="fact-label">
                                        <X className="fact-icon fact-icon-myth" size={16} />
                                        <span className="label-text">YOU MIGHT HAVE BEEN TAUGHT</span>
                                      </div>
                                      <p className="fact-myth">"{sub.myth}"</p>
                                    </div>
                                    <div className="fact-section">
                                      <div className="fact-label">
                                        <Check className="fact-icon fact-icon-truth" size={16} />
                                        <span className="label-text">CURRENT UNDERSTANDING</span>
                                      </div>
                                      <p className="fact-truth">{sub.truth}</p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="extended-fact-card">
                                  <div className="extended-fact-content">
                                    <div className="fact-section">
                                      <div className="fact-label">
                                        <X className="fact-icon fact-icon-myth" size={16} />
                                        <span className="label-text">YOU MIGHT HAVE BEEN TAUGHT</span>
                                      </div>
                                      <p className="fact-myth">"{sub.myth}"</p>
                                      <div className="fact-details">
                                        <p>{sub.details}</p>
                                      </div>
                                    </div>
                                    <div className="fact-section">
                                      <div className="fact-label">
                                        <Check className="fact-icon fact-icon-truth" size={16} />
                                        <span className="label-text">CURRENT UNDERSTANDING</span>
                                      </div>
                                      <p className="fact-truth">{sub.truth}</p>
                                      {sub.moreDetails && (
                                        <div className="fact-more-details">
                                          <p>{sub.moreDetails}</p>
                                        </div>
                                      )}
                                    </div>
                                    <div className="fact-section">
                                      <div className="fact-label">
                                        <BookOpen className="fact-icon fact-icon-sources" size={16} />
                                        <span className="label-text">SOURCES</span>
                                      </div>
                                      <div className="sources-text-list">
                                        {sub.sources.map((source, idx) => (
                                          <a
                                            key={idx}
                                            href={source}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="source-text-item"
                                            data-testid={`source-${sub.id}-${idx}`}
                                          >
                                            {source}
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="submission-footer-row" data-testid={`submission-footer-${sub.id}`}>
                                <span className="submission-timestamp" data-testid={`submission-timestamp-${sub.id}`}>Submitted on {sub.submittedAt}</span>
                                <span
                                  className="submission-status-badge submission-status-badge--pending"
                                  data-testid={`badge-submission-status-${sub.id}`}
                                >
                                  Pending
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {totalSubmissionsPages > 1 && (
                          <div className="submissions-pagination" data-testid="submissions-pagination">
                            <button
                              className="submissions-page-button"
                              disabled={submissionsPage === 1}
                              onClick={() => setSubmissionsPage(submissionsPage - 1)}
                              data-testid="button-submissions-prev"
                            >
                              Previous
                            </button>
                            <span className="submissions-page-info" data-testid="submissions-page-info">
                              Page {submissionsPage} of {totalSubmissionsPages}
                            </span>
                            <button
                              className="submissions-page-button"
                              disabled={submissionsPage === totalSubmissionsPages}
                              onClick={() => setSubmissionsPage(submissionsPage + 1)}
                              data-testid="button-submissions-next"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {activityTab === "approved" && (
                      <div className="submissions-section" data-testid="activity-approved">
                        <div className="submissions-grid" data-testid="approved-grid">
                          {mySubmissionsLoading ? (
                            <>
                              {[1, 2].map((i) => (
                                <div key={i} className="submission-skeleton-card" data-testid={`approved-skeleton-${i}`}>
                                  <div className="submission-skeleton-body" />
                                  <div className="submission-skeleton-footer" />
                                </div>
                              ))}
                            </>
                          ) : paginatedApproved.length === 0 ? (
                            <div className="submissions-empty" data-testid="approved-empty">No published submissions yet.</div>
                          ) : paginatedApproved.map((sub) => (
                            <div key={sub.id} className="submission-card-wrapper" data-testid={`approved-card-${sub.id}`}>
                              <div className="extended-fact-card">
                                <div className="extended-fact-content">
                                  <div className="fact-section">
                                    <div className="fact-label">
                                      <X className="fact-icon fact-icon-myth" size={16} />
                                      <span className="label-text">YOU MIGHT HAVE BEEN TAUGHT</span>
                                    </div>
                                    <p className="fact-myth">"{sub.myth}"</p>
                                    <div className="fact-details">
                                      <p>{sub.details}</p>
                                    </div>
                                  </div>
                                  <div className="fact-section">
                                    <div className="fact-label">
                                      <Check className="fact-icon fact-icon-truth" size={16} />
                                      <span className="label-text">CURRENT UNDERSTANDING</span>
                                    </div>
                                    <p className="fact-truth">{sub.truth}</p>
                                    {sub.moreDetails && (
                                      <div className="fact-more-details">
                                        <p>{sub.moreDetails}</p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="fact-section">
                                    <div className="fact-label">
                                      <BookOpen className="fact-icon fact-icon-sources" size={16} />
                                      <span className="label-text">SOURCES</span>
                                    </div>
                                    <div className="sources-text-list">
                                      {sub.sources.map((source, idx) => (
                                        <a
                                          key={idx}
                                          href={source}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="source-text-item"
                                          data-testid={`source-approved-${sub.id}-${idx}`}
                                        >
                                          {source}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="submission-footer-row" data-testid={`approved-footer-${sub.id}`}>
                                <span className="submission-timestamp" data-testid={`approved-timestamp-${sub.id}`}>Published on {sub.publishedAt}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  {sub.slug && (
                                    <Link href={`/fact/${sub.slug}`} className="view-submission-button" data-testid={`button-view-fact-${sub.id}`}>
                                      <span>View Fact</span>
                                      <ChevronRight size={14} />
                                    </Link>
                                  )}
                                  <span className="submission-status-badge submission-status-badge--approved" data-testid={`badge-approved-status-${sub.id}`}>
                                    Approved
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {totalApprovedPages > 1 && (
                          <div className="submissions-pagination" data-testid="approved-pagination">
                            <button
                              className="submissions-page-button"
                              disabled={approvedPage === 1}
                              onClick={() => setApprovedPage(approvedPage - 1)}
                              data-testid="button-approved-prev"
                            >
                              Previous
                            </button>
                            <span className="submissions-page-info" data-testid="approved-page-info">
                              Page {approvedPage} of {totalApprovedPages}
                            </span>
                            <button
                              className="submissions-page-button"
                              disabled={approvedPage === totalApprovedPages}
                              onClick={() => setApprovedPage(approvedPage + 1)}
                              data-testid="button-approved-next"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {activityTab === "not-approved" && (
                      <div className="submissions-section" data-testid="activity-not-approved">
                        <div className="submissions-grid" data-testid="rejected-grid">
                          {mySubmissionsLoading ? (
                            <>
                              {[1, 2].map((i) => (
                                <div key={i} className="submission-skeleton-card" data-testid={`rejected-skeleton-${i}`}>
                                  <div className="submission-skeleton-body" />
                                  <div className="submission-skeleton-footer" />
                                </div>
                              ))}
                            </>
                          ) : paginatedRejected.length === 0 ? (
                            <div className="submissions-empty" data-testid="rejected-empty">No rejected submissions.</div>
                          ) : paginatedRejected.map((sub) => (
                            <div key={sub.id} className="submission-card-wrapper" data-testid={`rejected-card-${sub.id}`}>
                              <div className={`denial-reason-card${expandedDenials[sub.id] ? " denial-reason-expanded" : ""}`} data-testid={`denial-reason-${sub.id}`}>
                                <p
                                  className={`denial-reason-text${expandedDenials[sub.id] ? "" : " denial-reason-clamped"}`}
                                  ref={(el) => { denialTextRefs.current[sub.id] = el; }}
                                >
                                  {sub.denialReason}
                                </p>
                                <div className={`denial-reason-fade${overflowingDenials[sub.id] ? "" : " denial-reason-fade-hidden"}`}>
                                  <span
                                    className="denial-reason-view-more"
                                    onClick={() => toggleDenialExpand(sub.id)}
                                    data-testid={expandedDenials[sub.id] ? `button-view-less-${sub.id}` : `button-view-more-${sub.id}`}
                                  >
                                    {expandedDenials[sub.id] ? "View Less" : "View More"}
                                  </span>
                                </div>
                              </div>
                              <div className="extended-fact-card">
                                <div className="extended-fact-content">
                                  <div className="fact-section">
                                    <div className="fact-label">
                                      <X className="fact-icon fact-icon-myth" size={16} />
                                      <span className="label-text">YOU MIGHT HAVE BEEN TAUGHT</span>
                                    </div>
                                    <p className="fact-myth">"{sub.myth}"</p>
                                    <div className="fact-details">
                                      <p>{sub.details}</p>
                                    </div>
                                  </div>
                                  <div className="fact-section">
                                    <div className="fact-label">
                                      <Check className="fact-icon fact-icon-truth" size={16} />
                                      <span className="label-text">CURRENT UNDERSTANDING</span>
                                    </div>
                                    <p className="fact-truth">{sub.truth}</p>
                                  </div>
                                  <div className="fact-section">
                                    <div className="fact-label">
                                      <BookOpen className="fact-icon fact-icon-sources" size={16} />
                                      <span className="label-text">SOURCES</span>
                                    </div>
                                    <div className="sources-text-list">
                                      {sub.sources.map((source, idx) => (
                                        <a
                                          key={idx}
                                          href={source}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="source-text-item"
                                          data-testid={`source-rejected-${sub.id}-${idx}`}
                                        >
                                          {source}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="submission-footer-row" data-testid={`rejected-footer-${sub.id}`}>
                                <span className="submission-timestamp" data-testid={`rejected-timestamp-${sub.id}`}>Submitted on {sub.submittedAt}</span>
                                <span className="submission-status-badge submission-status-badge--rejected" data-testid={`badge-rejected-status-${sub.id}`}>
                                  Not Approved
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {totalRejectedPages > 1 && (
                          <div className="submissions-pagination" data-testid="rejected-pagination">
                            <button
                              className="submissions-page-button"
                              disabled={rejectedPage === 1}
                              onClick={() => setRejectedPage(rejectedPage - 1)}
                              data-testid="button-rejected-prev"
                            >
                              Previous
                            </button>
                            <span className="submissions-page-info" data-testid="rejected-page-info">
                              Page {rejectedPage} of {totalRejectedPages}
                            </span>
                            <button
                              className="submissions-page-button"
                              disabled={rejectedPage === totalRejectedPages}
                              onClick={() => setRejectedPage(rejectedPage + 1)}
                              data-testid="button-rejected-next"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {activityTab === "comments" && (
                      <div data-testid="activity-comments-content">
                        {myCommentsLoading ? (
                          <div className="dashboard-feed-empty" data-testid="activity-comments-loading">
                            <p>Loading your comments...</p>
                          </div>
                        ) : myComments.length > 0 ? (
                          <div className="following-feed">
                            {myComments.map((c) => (
                              <div className="public-comment-entry" key={c.id} data-testid={`activity-comment-${c.id}`}>
                                <div className="following-post-body-content">
                                  <div className="following-post-body-left">
                                    <Link href={`/fact/${c.factSlug}`} className="following-post-link">
                                      <p className="fact-myth">"{c.factTitle}"</p>
                                    </Link>
                                    {dashboardEditingId === c.id ? (
                                      <div className="dashboard-comment-edit-box" data-testid={`edit-box-comment-${c.id}`}>
                                        <textarea
                                          className="dashboard-comment-edit-textarea"
                                          value={dashboardEditBody}
                                          onChange={(e) => setDashboardEditBody(e.target.value)}
                                          data-testid={`input-edit-comment-${c.id}`}
                                        />
                                        <div className="dashboard-comment-edit-actions">
                                          <button
                                            className="dashboard-comment-save-btn"
                                            onClick={() => dashboardEditMutation.mutate({ id: c.id, body: dashboardEditBody })}
                                            disabled={dashboardEditMutation.isPending || !dashboardEditBody.trim()}
                                            data-testid={`button-save-edit-comment-${c.id}`}
                                          >
                                            {dashboardEditMutation.isPending ? "Saving…" : "Save"}
                                          </button>
                                          <button
                                            className="dashboard-comment-cancel-btn"
                                            onClick={() => setDashboardEditingId(null)}
                                            data-testid={`button-cancel-edit-comment-${c.id}`}
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="following-plain-comment" data-testid={`activity-comment-text-${c.id}`}>{c.body}</p>
                                    )}
                                    <div className="comment-actions" data-testid={`activity-comment-actions-${c.id}`}>
                                      <button
                                        className={`comment-action upvote-action${c.isUpvotedByMe ? " upvoted" : ""}`}
                                        onClick={() => dashboardUpvoteMutation.mutate(c.id)}
                                        disabled={dashboardUpvoteMutation.isPending}
                                        data-testid={`button-upvote-comment-${c.id}`}
                                      >
                                        <ArrowUp size={14} />
                                        <span>{c.upvotes}</span>
                                      </button>
                                      <button
                                        className="comment-action"
                                        onClick={() => {
                                          setDashboardEditingId(c.id);
                                          setDashboardEditBody(c.body);
                                        }}
                                        data-testid={`button-edit-comment-${c.id}`}
                                      >
                                        <Pencil size={14} />
                                        <span>Edit</span>
                                      </button>
                                      <button
                                        className="comment-action"
                                        onClick={() => dashboardDeleteMutation.mutate(c.id)}
                                        disabled={dashboardDeleteMutation.isPending}
                                        data-testid={`button-delete-comment-${c.id}`}
                                      >
                                        <Trash2 size={14} />
                                        <span>Delete</span>
                                      </button>
                                    </div>
                                    <span className="public-comment-timestamp" data-testid={`activity-comment-time-${c.id}`}>
                                      {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                  </div>
                                  {c.factCoverPhoto && (
                                    <Link href={`/fact/${c.factSlug}`} className="following-post-cover-link" data-testid={`cover-link-activity-comment-${c.id}`}>
                                      <img src={c.factCoverPhoto} alt="" className="following-post-cover-photo" />
                                    </Link>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="dashboard-feed-empty" data-testid="activity-empty-comments">
                            <MessageSquare size={40} className="dashboard-feed-empty-icon" />
                            <p className="dashboard-feed-empty-title">You haven't commented on any topics yet.</p>
                            <p className="dashboard-feed-empty-desc">
                              Leave a comment on a misconception you care about to share your experiences.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </>
              )}

              {sideTab === "edit-requests" && (
                <>
                  <div className="notifications-tabs-wrapper">
                    <nav className="notifications-tabs" data-testid="edit-requests-tabs">
                      {EDIT_REQUESTS_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          className="notifications-tab edit-requests-tab-disabled"
                          data-testid={`button-edit-requests-tab-${tab.id}`}
                          onClick={(e) => e.preventDefault()}
                        >
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Mock data preserved below for future use — hidden during beta */}
                  {/* Pending: "Breakfast is the most important meal of the day" — Sources */}
                  {/* Approved: "Autism is caused by broken mirror neurons." — Timeline */}
                  {/* Not Approved: "People often repress traumatic memories." — Current Understanding */}

                  <div className="dashboard-feed-content" data-testid="dashboard-edit-requests-content">
                    <div className="edit-requests-beta-state" data-testid="edit-requests-beta-empty">
                      <img src={scrungyConfetti} alt="Scrungy the squirrel" className="edit-requests-beta-squirrel" />
                      <p className="edit-requests-beta-text">Editing content is unavailable in the beta. Scrungy is working on it!</p>
                    </div>
                  </div>
                </>
              )}

              {sideTab === "saved" && (
                <div className="saved-page" data-testid="saved-page">

                  <div className="notifications-tabs-wrapper" data-testid="saved-tabs-wrapper">
                    <div className="notifications-tabs" data-testid="saved-tabs">
                      {SAVED_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          className={`notifications-tab${savedTab === tab.id ? " notifications-tab-active" : ""}`}
                          onClick={() => setSavedTab(tab.id)}
                          data-testid={`button-saved-tab-${tab.id}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {savedTab === "facts" && (
                    <div className="saved-facts-row" data-testid="saved-facts-row">
                      {savedFactsLoading ? (
                        <p className="saved-empty-message" data-testid="text-saved-facts-loading">Loading saved facts...</p>
                      ) : savedFactItems.length === 0 ? (
                        <p className="saved-empty-message" data-testid="text-saved-facts-empty">No saved facts yet. Bookmark facts to see them here.</p>
                      ) : (
                        savedFactItems.map((fact) => (
                          <FactCard
                            key={fact.id}
                            fact={fact}
                            onSave={() => unsaveFactMutation.mutate(fact.id)}
                            onShare={() => {}}
                            onComment={() => {}}
                            isSaved={true}
                            onBetaClick={(factId) => setSourcesModalFactId(factId)}
                          />
                        ))
                      )}
                    </div>
                  )}

                  {savedTab === "articles" && (
                    <div className="saved-article-section" data-testid="saved-article-row">
                      {savedArticlesLoading ? (
                        <p className="saved-empty-message" data-testid="text-saved-articles-loading">Loading saved articles...</p>
                      ) : sortedArticleItems.length === 0 ? (
                        <p className="saved-empty-message" data-testid="text-saved-articles-empty">No saved articles yet. Bookmark articles on the Articles page to see them here.</p>
                      ) : sortedArticleItems.length > 0 ? (
                        <>
                          <div className="sort-selector" ref={savedArticlesSortRef} data-testid="saved-articles-controls">
                            <div className="sort-selector-label">
                              <List size={16} className="sort-selector-icon" />
                              <span className="sort-selector-text">Sort by:</span>
                            </div>
                            <div className="sort-selector-dropdown-wrapper">
                              <button
                                className="sort-selector-dropdown-trigger"
                                onClick={() => setSavedArticlesSortOpen(o => !o)}
                                data-testid="button-saved-articles-sort"
                              >
                                <span>{savedArticlesSort === "posted" ? "By date posted" : "By date saved"}</span>
                                <ChevronDown size={14} className={`sort-selector-chevron${savedArticlesSortOpen ? " open" : ""}`} />
                              </button>
                              {savedArticlesSortOpen && (
                                <div className="sort-selector-dropdown" data-testid="sort-articles-dropdown-menu">
                                  {(["saved", "posted"] as const).map(opt => (
                                    <button
                                      key={opt}
                                      className={`sort-selector-option${savedArticlesSort === opt ? " selected" : ""}`}
                                      onClick={() => { setSavedArticlesSort(opt); setSavedArticlesSortOpen(false); }}
                                      data-testid={`button-articles-sort-${opt}`}
                                    >
                                      {opt === "saved" ? "By date saved" : "By date posted"}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="saved-articles-grid" data-testid="saved-articles-grid">
                            {sortedArticleItems.map((article) => (
                              <BlogCard
                                key={article.id}
                                id={article.articleType === "internal" ? article.slug : article.id}
                                image={article.coverImage || ""}
                                date={formatSavedArticleDate(article.publishedAt)}
                                category={article.category}
                                title={article.title}
                                summary={article.summary || ""}
                                tags={[]}
                                isExternal={article.articleType === "external"}
                                externalUrl={article.articleType === "external" ? article.externalUrl : null}
                                publicationName={article.publicationName}
                                originalPublishedAt={article.originalPublishedAt}
                                publishedAtIso={article.publishedAt}
                              />
                            ))}
                          </div>
                        </>
                      ) : null}
                    </div>
                  )}

                  {savedTab === "comments" && (
                    <div data-testid="saved-comments-section">
                      {savedCommentsLoading ? (
                        <p className="saved-empty-message" data-testid="text-saved-comments-loading">Loading saved comments...</p>
                      ) : savedCommentItems.length === 0 ? (
                        <p className="saved-empty-message" data-testid="text-saved-comments-empty">No saved comments yet. Bookmark comments on fact pages to see them here.</p>
                      ) : (
                        savedCommentItems.map((item) => {
                          const ellipsisKey = `ellipsis-saved-${item.commentId}`;
                          const timeAgo = (() => {
                            const diff = Date.now() - new Date(item.commentCreatedAt).getTime();
                            const mins = Math.floor(diff / 60000);
                            if (mins < 60) return `${mins || 1}m ago`;
                            const hrs = Math.floor(mins / 60);
                            if (hrs < 24) return `${hrs}h ago`;
                            const days = Math.floor(hrs / 24);
                            if (days < 7) return `${days}d ago`;
                            return new Date(item.commentCreatedAt).toLocaleDateString();
                          })();
                          return (
                            <div key={item.commentId} className="saved-comment" data-testid={`saved-comment-${item.commentId}`}>
                              <div className="following-post-body-content">
                                <div className="following-post-body-left">
                                  <Link href={`/fact/${item.factSlug}`} className="following-post-link" data-testid={`link-saved-fact-${item.commentId}`}>
                                    <p className="fact-myth">"{item.factMythHeader}"</p>
                                  </Link>
                                  <div className="saved-comment-meta" data-testid={`saved-comment-meta-${item.commentId}`}>
                                    {item.commenterUsername ? (
                                      <Link href={`/user/${item.commenterUsername}`} className="saved-comment-username" data-testid={`link-saved-user-${item.commentId}`}>{item.commenterUsername}</Link>
                                    ) : (
                                      <span className="saved-comment-username" data-testid={`saved-user-deleted-${item.commentId}`}>[deleted]</span>
                                    )}
                                    <span className="saved-comment-action">commented</span>
                                    <span className="saved-comment-dot">·</span>
                                    <span className="saved-comment-time" data-testid={`saved-comment-time-${item.commentId}`}>{timeAgo}</span>
                                  </div>
                                  <p className="following-plain-comment" data-testid={`saved-comment-text-${item.commentId}`}>{item.body}</p>
                                  <div className="comment-actions" data-testid={`saved-comment-actions-${item.commentId}`}>
                                    <button className="comment-action disabled-action" data-tooltip="Unavailable in beta" data-testid={`button-reply-saved-${item.commentId}`}>
                                      <CornerUpLeft size={14} />
                                      <span>Reply</span>
                                    </button>
                                    <button className="comment-action disabled-action" data-testid={`button-like-saved-${item.commentId}`}>
                                      <Heart size={14} />
                                      <span>{item.upvotes} {item.upvotes === 1 ? "like" : "likes"}</span>
                                    </button>
                                    <button
                                      className="comment-action comment-action-unsave"
                                      onClick={() => unsaveCommentMutation.mutate(item.commentId)}
                                      data-testid={`button-unsave-saved-${item.commentId}`}
                                    >
                                      <Bookmark size={14} className="unsave-icon" />
                                      <span>Unsave</span>
                                    </button>
                                    <div className="comment-ellipsis-wrapper">
                                      <button className="comment-action comment-ellipsis-btn" onClick={() => setActiveEllipsisId(activeEllipsisId === ellipsisKey ? null : ellipsisKey)} data-testid={`button-ellipsis-saved-${item.commentId}`}>
                                        <MoreHorizontal size={14} />
                                      </button>
                                      {activeEllipsisId === ellipsisKey && (
                                        <div className="comment-ellipsis-dropdown" data-testid={`dropdown-ellipsis-saved-${item.commentId}`}>
                                          <button className="comment-ellipsis-item disabled-action" data-tooltip="Unavailable in beta" data-testid={`button-follow-comment-saved-${item.commentId}`}>
                                            <BellPlus size={14} />
                                            <span>Follow comment</span>
                                          </button>
                                          <button className="comment-ellipsis-item disabled-action" data-tooltip="Unavailable in beta" data-testid={`button-report-saved-${item.commentId}`}>
                                            <FlagTriangleRight size={14} />
                                            <span>Report</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {item.factCoverPhoto && (
                                  <Link href={`/fact/${item.factSlug}`} className="following-post-cover-link" data-testid={`cover-link-saved-comment-${item.commentId}`}>
                                    <img src={item.factCoverPhoto} alt="" className="following-post-cover-photo" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                </div>
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
                          onChange={async () => {
                            const next = !allowFollows;
                            setAllowFollows(next);
                            try {
                              await updateUser({ allowFollows: next });
                            } catch {
                              setAllowFollows(!next);
                              toast({ title: "Failed to update setting", description: "Please try again.", variant: "destructive" });
                            }
                          }}
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
                  src={editProfilePhoto || placeholderPhoto}
                  alt="Profile preview"
                  className="edit-profile-photo-preview"
                  data-testid="img-edit-photo-preview"
                />
                <button
                  type="button"
                  className="edit-profile-photo-upload"
                  onClick={() => setIsAvatarPickerOpen(true)}
                  data-testid="button-change-avatar"
                >
                  Change avatar
                </button>
              </div>
            </div>

            <div className="edit-profile-section">
              <label className="edit-profile-label">USERNAME</label>
              <input
                type="text"
                className="edit-profile-input edit-profile-input-half"
                value={editUsername}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditUsername(val);
                  setEditUsernameError(val.length > 0 ? validateUsername(val) : null);
                }}
                data-testid="input-edit-username"
              />
              {editUsernameError && (
                <p style={{ color: '#FF5353', fontSize: '12px', fontFamily: "'Public Sans', sans-serif", marginTop: '4px', marginBottom: 0 }} data-testid="text-edit-username-error">
                  {editUsernameError}
                </p>
              )}
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
                    <div key={index} className="edit-profile-place-row">
                      {entry.country === "United States" ? (
                        <div className="edit-profile-location-inline-row" style={{ flex: 1 }}>
                          <div className="edit-profile-location-inline-field">
                            <StateSelect
                              value={entry.usState}
                              onChange={(val) => handlePlaceLivedStateChange(index, val)}
                              testId={`input-edit-place-lived-state-${index}`}
                            />
                          </div>
                          <div className="edit-profile-location-inline-field">
                            <LocationSelect
                              value={entry.country}
                              onChange={(val) => handlePlaceLivedChange(index, val)}
                              placeholder="Search country..."
                              testId={`input-edit-place-lived-${index}`}
                              icon="home"
                            />
                          </div>
                        </div>
                      ) : (
                        <LocationSelect
                          value={entry.country}
                          onChange={(val) => handlePlaceLivedChange(index, val)}
                          placeholder="Search country..."
                          testId={`input-edit-place-lived-${index}`}
                          icon="home"
                        />
                      )}
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
              disabled={editUsernameError !== null || isSavingProfile}
              style={(editUsernameError !== null || isSavingProfile) ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              onClick={async () => {
                setIsSavingProfile(true);
                const currentLocation = editCurrentCountry
                  ? editCurrentState
                    ? `${editCurrentState}, ${editCurrentCountry}`
                    : editCurrentCountry
                  : "";
                const placesLived = editPlacesLived
                  .filter((p) => p.country)
                  .map((p) => p.usState ? `${p.usState}, ${p.country}` : p.country);
                await updateUser({
                  profilePhoto: editProfilePhoto,
                  username: editUsername,
                  misinfoSource: editMisinfo,
                  currentLocation,
                  showCurrentLocation: editShowCurrentLocation,
                  placesLived,
                  showPlacesLived: editShowPlacesLived,
                  favoriteTags: editTags,
                });
                setIsSavingProfile(false);
                setEditModalOpen(false);
              }}
            >
              {isSavingProfile ? "Saving…" : "Save Changes"}
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

      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        currentAvatar={editProfilePhoto}
        onSave={(uri) => setEditProfilePhoto(uri)}
      />
      <SourcesModal
        factId={sourcesModalFactId}
        onClose={() => setSourcesModalFactId(null)}
      />
      <TopicsModal
        isOpen={topicsModalOpen}
        onClose={() => setTopicsModalOpen(false)}
      />
    </div>
  );
}
