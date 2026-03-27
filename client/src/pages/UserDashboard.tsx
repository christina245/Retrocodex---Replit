import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { MapPin, Pencil, X, Home, Plus, Minus, XCircle, Search, Bookmark, Users, MapPinned, BellRing, FileText, MessageSquare, FilePenLine, CheckCircle, Check, BookOpen, ChevronRight, Send, Newspaper, UserRoundPen, PenLine, Settings, LogOut, Shield, Bell, User, Trash2, Lock, CornerUpLeft, Heart, MessageSquareMore, UserRoundPlus, CircleCheckBig, CircleCheck, MapPinCheckInside, MonitorX, PlusCircle, Clock, MoreHorizontal, BellPlus, FlagTriangleRight, GitCommitHorizontal, MessageCircleMore, SearchCheck } from "lucide-react";
import forwardArrow from "@assets/forward triangle red.png";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SingleFactHeader } from "@/components/SingleFactHeader";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { FactCard } from "@/components/FactCard";
import type { Fact as FactCardFact } from "@/components/FactCard";
import type { Fact as DbFact } from "@shared/schema";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/lib/auth";
import { validateUsername } from "@/lib/usernameValidation";
import { AvatarPickerModal } from "@/components/AvatarPickerModal";
import placeholderPhoto from "@assets/elementor-placeholder-image_1770884094599.png";
import { NotificationBell } from "@/components/NotificationBell";
import FeedArticleCard from "@/components/FeedArticleCard";
import "../components/ExtendedFactCard.css";
import "../components/HomepageTabs.css";
import "../components/CommentsSection.css";
import { AdminBadge } from "@/components/AdminBadge";
import { getCountryFlag } from "@/lib/countryFlags";
import "./UserDashboard.css";

type DashboardTab = "for-you" | "following" | "local" | "fact-updates";
type SideTab = "feed" | "notifications" | "edit-profile" | "activity" | "edit-requests" | "saved" | "settings";
type NotificationsTab = "all" | "replies" | "comments";
type ActivityTab = "submitted" | "approved" | "not-approved" | "comments" | "polls";
type EditRequestsTab = "pending" | "approved" | "not-approved";
type ProfileActivityTab = "submissions" | "edits" | "comments";
type SavedTab = "all" | "facts" | "articles" | "comments";

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
  { id: "polls", label: "Polls" },
];

const SAVED_TABS: { id: SavedTab; label: string }[] = [
  { id: "all", label: "All" },
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

export default function UserDashboard() {
  const { user, isLoggedIn, isLoading: authLoading, logout, updateUser } = useAuth();
  const [, navigate] = useLocation();

  const initialTab = (() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["feed", "notifications", "edit-profile", "activity", "edit-requests", "saved", "settings"].includes(tab)) {
      return tab as SideTab;
    }
    return "feed" as SideTab;
  })();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showAllPlaces, setShowAllPlaces] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [editProfilePhoto, setEditProfilePhoto] = useState(user?.profilePhoto || "");
  const [feedTab, setFeedTab] = useState<DashboardTab>("for-you");
  const [hoveredFeedTab, setHoveredFeedTab] = useState<DashboardTab | null>(null);
  const [sideTab, setSideTab] = useState<SideTab>(initialTab);
  const [notificationsTab, setNotificationsTab] = useState<NotificationsTab>("all");
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
  const [allowFollows, setAllowFollows] = useState(true);
  const [followedBack, setFollowedBack] = useState<Record<string, boolean>>({});
  const [publicProfile, setPublicProfile] = useState(true);
  const [notifyFollows, setNotifyFollows] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyFactUpdates, setNotifyFactUpdates] = useState(true);
  const [emailNotifyFollows, setEmailNotifyFollows] = useState(true);
  const [emailNotifyComments, setEmailNotifyComments] = useState(true);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [activeEllipsisId, setActiveEllipsisId] = useState<string | null>(null);
  const [savedTab, setSavedTab] = useState<SavedTab>("all");

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
  const [emailNotifyFactUpdates, setEmailNotifyFactUpdates] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [notificationCount] = useState(3);


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

  interface PollVoteItem {
    id: string;
    userId: string;
    factId: string;
    optionChosen: string;
    locationChosen: string | null;
    votedAt: string;
    factTitle: string;
    factSlug: string;
    factCoverPhoto: string | null;
  }

  const { data: myPollVotes = [], isLoading: pollVotesLoading } = useQuery<PollVoteItem[]>({
    queryKey: ["/api/poll-votes/me"],
    enabled: isLoggedIn,
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
    savedAt: string;
  }

  const queryClient = useQueryClient();

  const { data: savedArticleItems = [], isLoading: savedArticlesLoading } = useQuery<SavedArticleItem[]>({
    queryKey: ["/api/user/saved-articles"],
    enabled: isLoggedIn,
  });

  const { data: savedDbFacts = [], isLoading: savedFactsLoading } = useQuery<DbFact[]>({
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
    };
  });

  const unsaveFactMutation = useMutation({
    mutationFn: (factId: string) => apiRequest("DELETE", `/api/user/saved-facts/${factId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/saved-facts"] });
    },
  });

  const unsaveArticleMutation = useMutation({
    mutationFn: (articleKey: string) => apiRequest("DELETE", `/api/user/saved-articles/${encodeURIComponent(articleKey)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/saved-articles"] });
    },
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


  const handleFeedTabChange = useCallback((tab: DashboardTab) => {
    setFeedTab(tab);
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

  const dummyActivityComments = [
    {
      id: "act-comment-1",
      factTitle: "Christopher Columbus discovered the Americas in 1492",
      factLink: "/fact/christopher-columbus-discovered-americas",
      coverPhoto: "/uploads/1764719426643-922952402.png",
      comment: "This is one of the most persistent myths I grew up with. It wasn't until college that I learned about the Norse expeditions and the millions of Indigenous peoples who had been living there for thousands of years. History education really needs an overhaul.",
      timestamp: "3 hours ago",
    },
    {
      id: "act-comment-2",
      factTitle: "Men and women have very different brains.",
      factLink: "/fact/men-women-different-brains",
      coverPhoto: "/uploads/1764752045366-476242776.png",
      comment: "I was told this so many times by everybody growing up! I just thought it made sense because I saw so many differences in how men and women behaved. But the evidence is actually very clear that a lot of these distinctions come from socialization and not innate differences.",
      timestamp: "1 day ago",
    },
  ];

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
                      user.favoriteTags.length > 0 ? (
                        <div className="following-feed" data-testid="feed-for-you">
                          <div className="following-post" data-testid="for-you-post-1">
                            <img src={placeholderPhoto} alt="MythBuster_77" className="following-post-avatar" />
                            <div className="following-post-main">
                            <div className="following-post-header">
                              <div className="following-post-header-text">
                                <Link href="/user/MythBuster_77" className="following-post-username" data-testid="link-user-MythBuster_77">MythBuster_77</Link>
                                <span className="following-post-action">submitted a new topic</span>
                              </div>
                              <span className="following-post-timestamp">5 mins ago</span>
                            </div>
                            <div className="following-post-body following-post-factcard">
                              <FactCard
                                fact={{
                                  id: "cracking-your-knuckles-arthritis",
                                  category: "EVERYDAY LIFE",
                                  categoryColor: "#0167A2",
                                  myth: "Cracking your knuckles will give you arthritis.",
                                  truth: "No scientific evidence has yet to link cracking your knuckles and arthritis.",
                                  link: "/fact/cracking-your-knuckles-arthritis",
                                  coverPhoto: "/uploads/1764735935195-591724829.png",
                                }}
                                onSave={() => {}}
                                onShare={() => {}}
                                onComment={() => {}}
                              />
                            </div>
                            </div>
                          </div>

                          <div className="following-post" data-testid="for-you-post-article">
                            <img src={placeholderPhoto} alt="FactChecker_99" className="following-post-avatar" />
                            <div className="following-post-main">
                            <div className="following-post-header">
                              <div className="following-post-header-text">
                                <Link href="/user/FactChecker_99" className="following-post-username" data-testid="link-user-FactChecker_99-foryou">FactChecker_99</Link>
                                <span className="following-post-action">submitted an article</span>
                              </div>
                              <span className="following-post-timestamp">20 mins ago</span>
                            </div>
                            <div className="following-post-body">
                              <FeedArticleCard
                                title="5 Myths You Might Hear Going Home For the Holidays"
                                summary="Some advice you might have heard from the family while growing up about what's harmful might have been an unnecessary scare, and some things you've been told will cause utter damage might be harmless. If you're heading to the family gatherings this holiday season, here are some familiar sayings about food, people, and mental health you're likely to hear that actually aren't true."
                                coverImage="/uploads/1764995940108-220172306.jpg"
                                category="Everyday Life"
                                slug="going-home-for-the-holidays-myths-2025"
                              />
                            </div>
                            </div>
                          </div>

                          <div className="following-post" data-testid="for-you-post-2">
                            <img src={placeholderPhoto} alt="SkepticalSam" className="following-post-avatar" />
                            <div className="following-post-main">
                            <div className="following-post-header">
                              <div className="following-post-header-text">
                                <Link href="/user/SkepticalSam" className="following-post-username" data-testid="link-user-SkepticalSam">SkepticalSam</Link>
                                <span className="following-post-action">submitted a new topic</span>
                              </div>
                              <span className="following-post-timestamp">1 hour ago</span>
                            </div>
                            <div className="following-post-body following-post-factcard">
                              <FactCard
                                fact={{
                                  id: "breakfast-most-important-meal-of-the-day",
                                  category: "HEALTH & FITNESS",
                                  categoryColor: "#EC7200",
                                  myth: "Breakfast is the most important meal of the day.",
                                  truth: "While eating breakfast can be beneficial for certain lifestyles, research shows that its importance varies widely based on individual metabolism, cultural norms, and overall diet.",
                                  link: "/fact/breakfast-most-important-meal-of-the-day",
                                  coverPhoto: "/uploads/1765021400264-394912154.png",
                                }}
                                onSave={() => {}}
                                onShare={() => {}}
                                onComment={() => {}}
                              />
                            </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="dashboard-feed-empty" data-testid="feed-empty-for-you">
                          <Search size={40} className="dashboard-feed-empty-icon" />
                          <p className="dashboard-feed-empty-title">Select your interests</p>
                          <p className="dashboard-feed-empty-desc">
                            Choose topics you're interested in to see relevant submissions in your feed.
                          </p>
                          <button
                            className="for-you-select-tags-button"
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
                            data-testid="button-select-interests"
                          >
                            Select Interests
                          </button>
                        </div>
                      )
                    )}

                    {feedTab === "following" && (
                      <div className="following-feed" data-testid="feed-following">
                        <div className="following-post" data-testid="following-post-1">
                          <img src={placeholderPhoto} alt="LogicGamer_01" className="following-post-avatar" />
                          <div className="following-post-main">
                          <div className="following-post-header">
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
                        </div>

                        <div className="following-post" data-testid="following-post-article">
                          <img src={placeholderPhoto} alt="FactChecker_99" className="following-post-avatar" />
                          <div className="following-post-main">
                          <div className="following-post-header">
                            <div className="following-post-header-text">
                              <Link href="/user/FactChecker_99" className="following-post-username" data-testid="link-user-FactChecker_99">FactChecker_99</Link>
                              <span className="following-post-action">submitted an article</span>
                            </div>
                            <span className="following-post-timestamp">8 mins ago</span>
                          </div>
                          <div className="following-post-body">
                            <FeedArticleCard
                              title="5 Myths You Might Hear Going Home For the Holidays"
                              summary="Some advice you might have heard from the family while growing up about what's harmful might have been an unnecessary scare, and some things you've been told will cause utter damage might be harmless. If you're heading to the family gatherings this holiday season, here are some familiar sayings about food, people, and mental health you're likely to hear that actually aren't true."
                              coverImage="/uploads/1764995940108-220172306.jpg"
                              category="Everyday Life"
                              slug="going-home-for-the-holidays-myths-2025"
                            />
                          </div>
                          </div>
                        </div>


                        <div className="following-post" data-testid="following-post-3">
                          <img src={placeholderPhoto} alt="Ackshually_42" className="following-post-avatar" />
                          <div className="following-post-main">
                          <div className="following-post-header">
                            <div className="following-post-header-text">
                              <Link href="/user/Ackshually_42" className="following-post-username" data-testid="link-user-Ackshually_42">Ackshually_42</Link>
                              <span className="following-post-action">commented on</span>
                            </div>
                            <span className="following-post-timestamp">3 hours ago</span>
                          </div>
                          <div className="following-post-body">
                            <div className="following-post-body-content">
                              <div className="following-post-body-left">
                                <Link href="/fact/christopher-columbus-discovered-americas" className="following-post-link">
                                  <p className="fact-myth">"Christopher Columbus discovered the Americas in 1492"</p>
                                </Link>
                                <p className="following-plain-comment" data-testid="following-plain-comment">Ackshually, to be pedantic, the term 'discovery' is a Eurocentric misnomer. Not only were millions of Indigenous people already inhabitant of the land, but the Norse explorer Leif Erikson had already established a settlement at L'Anse aux Meadows nearly five centuries prior. Columbus didn't even set foot on the North American mainland during his 1492 voyage; he was strictly in the Caribbean.</p>
                                <div className="comment-actions" data-testid="following-comment-actions">
                                  <button className="comment-action" onClick={() => setActiveReplyId(activeReplyId === 'following' ? null : 'following')} data-testid="button-reply-following">
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
                                  <div className="comment-ellipsis-wrapper">
                                    <button className="comment-action comment-ellipsis-btn" onClick={() => setActiveEllipsisId(activeEllipsisId === 'following' ? null : 'following')} data-testid="button-ellipsis-following">
                                      <MoreHorizontal size={14} />
                                    </button>
                                    {activeEllipsisId === 'following' && (
                                      <div className="comment-ellipsis-dropdown" data-testid="dropdown-ellipsis-following">
                                        <button className="comment-ellipsis-item disabled-action" data-tooltip="Unavailable in beta" data-testid="button-follow-comment-following">
                                          <BellPlus size={14} />
                                          <span>Follow comment</span>
                                        </button>
                                        <button className="comment-ellipsis-item disabled-action" data-tooltip="Unavailable in beta" data-testid="button-report-following">
                                          <FlagTriangleRight size={14} />
                                          <span>Report</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {activeReplyId === 'following' && (
                                  <div className="inline-reply-box" data-testid="inline-reply-following">
                                    <textarea placeholder="Write a reply..." data-testid="input-reply-following" />
                                    <div className="inline-reply-actions">
                                      <button className="inline-reply-btn" data-testid="button-submit-reply-following">Reply</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Link href="/fact/christopher-columbus-discovered-americas" className="following-post-cover-link" data-testid="cover-link-following-3">
                                <img src="/uploads/1764732977459-366971984.png" alt="" className="following-post-cover-photo" />
                              </Link>
                            </div>
                          </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {feedTab === "local" && (
                      <div className="following-feed" data-testid="feed-local">
                        <p className="local-feed-description" data-testid="local-feed-description">Activity from users currently located in your current or past locations.</p>

                        <div className="following-post" data-testid="local-post-1">
                          <img src={placeholderPhoto} alt="CtrlAltDefeat" className="following-post-avatar" />
                          <div className="following-post-main">
                          <div className="following-post-header">
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
                        </div>


                        <div className="following-post" data-testid="local-post-3">
                          <img src={placeholderPhoto} alt="CaffeineOverflow" className="following-post-avatar" />
                          <div className="following-post-main">
                          <div className="following-post-header">
                            <div className="following-post-header-text">
                              <Link href="/user/CaffeineOverflow" className="following-post-username" data-testid="link-user-CaffeineOverflow">CaffeineOverflow</Link>
                              <span className="following-post-action">from</span>
                              <span className="following-post-location" data-testid="local-location-3">Brazil</span>
                              <span className="following-post-action">commented on</span>
                            </div>
                            <span className="following-post-timestamp">1 hour ago</span>
                          </div>
                          <div className="following-post-body">
                            <div className="following-post-body-content">
                              <div className="following-post-body-left">
                                <Link href="/fact/sweating-burning-fat" className="following-post-link">
                                  <p className="fact-myth">"Does sweating mean you're burning fat?"</p>
                                </Link>
                                <p className="following-plain-comment" data-testid="local-plain-comment">Living in Rio, people at the gym constantly think sweating buckets equals a better workout. But sweat is just thermoregulation — your body cooling itself down. You can burn tons of calories in cold water swimming without sweating at all.</p>
                                <div className="comment-actions" data-testid="local-comment-actions-1">
                                  <button className="comment-action" onClick={() => setActiveReplyId(activeReplyId === 'local-1' ? null : 'local-1')} data-testid="button-reply-local-1">
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
                                  <div className="comment-ellipsis-wrapper">
                                    <button className="comment-action comment-ellipsis-btn" onClick={() => setActiveEllipsisId(activeEllipsisId === 'local-1' ? null : 'local-1')} data-testid="button-ellipsis-local-1">
                                      <MoreHorizontal size={14} />
                                    </button>
                                    {activeEllipsisId === 'local-1' && (
                                      <div className="comment-ellipsis-dropdown" data-testid="dropdown-ellipsis-local-1">
                                        <button className="comment-ellipsis-item disabled-action" data-tooltip="Unavailable in beta" data-testid="button-follow-comment-local-1">
                                          <BellPlus size={14} />
                                          <span>Follow comment</span>
                                        </button>
                                        <button className="comment-ellipsis-item disabled-action" data-tooltip="Unavailable in beta" data-testid="button-report-local-1">
                                          <FlagTriangleRight size={14} />
                                          <span>Report</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {activeReplyId === 'local-1' && (
                                  <div className="inline-reply-box" data-testid="inline-reply-local-1">
                                    <textarea placeholder="Write a reply..." data-testid="input-reply-local-1" />
                                    <div className="inline-reply-actions">
                                      <button className="inline-reply-btn" data-testid="button-submit-reply-local-1">Reply</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Link href="/fact/sweating-burning-fat" className="following-post-cover-link" data-testid="cover-link-local-3">
                                <img src="/uploads/1764995940108-220172306.jpg" alt="" className="following-post-cover-photo" />
                              </Link>
                            </div>
                          </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {feedTab === "fact-updates" && (
                      <div className="following-feed" data-testid="feed-fact-updates">

                        {/* Fact Update 1: Food Pyramid revision */}
                        <div className="activity-post" data-testid="fact-update-post-1">
                          <div className="activity-post-icon-col">
                            <PlusCircle size={40} strokeWidth={1.5} className="activity-status-icon activity-status-update" />
                          </div>
                          <div className="activity-post-main">
                            <div className="activity-post-header">
                              <div className="activity-post-header-text">
                                <Link href="/fact/breakfast-most-important-meal-of-the-day" className="following-post-link">
                                  <p className="fact-myth">"The Food Pyramid is the model for a healthy, balanced diet."</p>
                                </Link>
                              </div>
                              <span className="following-post-timestamp">1 day ago</span>
                            </div>
                            <div className="activity-post-body">
                              <div className="following-post-body-content">
                                <div className="following-post-body-left">
                                  <p className="activity-submitted-label">Revision:</p>
                                  <div className="activity-submitted-revision">
                                    <Check size={16} className="activity-revision-check" />
                                    <p className="activity-truth-text">In 2026, the US government introduced a new food pyramid that prioritized vegetables and protein while relegating grains to the bottom.</p>
                                  </div>
                                </div>
                                <Link href="/fact/breakfast-most-important-meal-of-the-day" className="following-post-cover-link" data-testid="cover-link-fact-update-1">
                                  <img src="/uploads/1764995940108-220172306.jpg" alt="" className="following-post-cover-photo" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Fact Update 2: Pluto - timeline entry revision */}
                        <div className="activity-post" data-testid="fact-update-post-2">
                          <div className="activity-post-icon-col">
                            <PlusCircle size={40} strokeWidth={1.5} className="activity-status-icon activity-status-update" />
                          </div>
                          <div className="activity-post-main">
                            <div className="activity-post-header">
                              <div className="activity-post-header-text">
                                <Link href="/fact/is-pluto-a-planet" className="following-post-link">
                                  <p className="fact-myth">"Pluto is a planet."</p>
                                </Link>
                              </div>
                              <span className="following-post-timestamp">3 days ago</span>
                            </div>
                            <div className="activity-post-body">
                              <div className="following-post-body-content">
                                <div className="following-post-body-left">
                                  <p className="activity-submitted-label">Revision:</p>
                                  <div className="activity-submitted-revision">
                                    <GitCommitHorizontal size={16} className="activity-revision-icon activity-revision-timeline" />
                                    <div className="activity-timeline-revision">
                                      <p className="activity-timeline-year">2026</p>
                                      <p className="activity-truth-text">New Horizons data continued to reveal Pluto's geological complexity, including evidence of a subsurface ocean beneath its icy crust. Despite renewed public petitions, the IAU reaffirmed its 2006 classification, noting that the criteria for planetary status remain unchanged.</p>
                                    </div>
                                  </div>
                                </div>
                                <Link href="/fact/is-pluto-a-planet" className="following-post-cover-link" data-testid="cover-link-fact-update-2">
                                  <img src="/objects/uploads/0c6481cd-9156-4d02-a7c1-db51995f9432.png" alt="" className="following-post-cover-photo" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Fact Update 3: Five senses - truth details revision */}
                        <div className="activity-post" data-testid="fact-update-post-3">
                          <div className="activity-post-icon-col">
                            <PlusCircle size={40} strokeWidth={1.5} className="activity-status-icon activity-status-update" />
                          </div>
                          <div className="activity-post-main">
                            <div className="activity-post-header">
                              <div className="activity-post-header-text">
                                <Link href="/fact/do-humans-only-have-five-senses" className="following-post-link">
                                  <p className="fact-myth">"Humans only have five senses."</p>
                                </Link>
                              </div>
                              <span className="following-post-timestamp">1 week ago</span>
                            </div>
                            <div className="activity-post-body">
                              <div className="following-post-body-content">
                                <div className="following-post-body-left">
                                  <p className="activity-submitted-label">Revision:</p>
                                  <div className="activity-submitted-revision">
                                    <Check size={16} className="activity-revision-check" />
                                    <p className="activity-truth-text">Researchers have since identified at least 21 distinct senses, including proprioception (body position), nociception (pain), thermoception (temperature), equilibrioception (balance), and interoception (internal body states like hunger and thirst). The original five-sense model attributed to Aristotle was a simplification that persisted for centuries.</p>
                                  </div>
                                </div>
                                <Link href="/fact/do-humans-only-have-five-senses" className="following-post-cover-link" data-testid="cover-link-fact-update-3">
                                  <img src="/uploads/1764732977459-366971984.png" alt="" className="following-post-cover-photo" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>

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
                    <div className="following-feed" data-testid="activity-feed-all">

                      {/* SAMPLE CARD — static placeholder for CSS styling, remove when live data is ready */}
                      <div className="activity-post" data-testid="notif-sample-under-review">
                        <div className="activity-post-icon-col">
                          <SearchCheck size={40} strokeWidth={1.5} className="activity-status-icon" style={{ color: "#878787" }} />
                        </div>
                        <div className="activity-post-main">
                          <div className="activity-post-header">
                            <div className="activity-post-header-text">
                              <span className="activity-status-text" style={{ color: "#555" }}>Your submission is currently under review!</span>
                            </div>
                            <span className="following-post-timestamp">Mar 24</span>
                          </div>
                          <div className="activity-post-body">
                            <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>We'll email you when we've made our edits and additions.</p>
                            <p className="activity-submitted-label">You submitted:</p>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem", marginBottom: "0.3rem" }}>
                              <X size={13} style={{ color: "#e53e3e", flexShrink: 0, marginTop: "3px" }} />
                              <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }} data-testid="notif-myth-sample">"Humans only use 10% of their brain"</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                              <Check size={13} style={{ color: "#38a169", flexShrink: 0, marginTop: "3px" }} />
                              <p style={{ margin: 0, fontSize: "0.9rem" }} data-testid="notif-truth-sample">Brain scans show activity across virtually all brain regions, even during sleep.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* END SAMPLE CARD */}

                      {/* Live submission notifications */}
                      {mySubmissions.filter(s => s.status === "saved").map(s => (
                        <div key={`notif-saved-${s.id}`} className="activity-post" data-testid={`notif-under-review-${s.id}`}>
                          <div className="activity-post-icon-col">
                            <SearchCheck size={40} strokeWidth={1.5} className="activity-status-icon" style={{ color: "#878787" }} />
                          </div>
                          <div className="activity-post-main">
                            <div className="activity-post-header">
                              <div className="activity-post-header-text">
                                <span className="activity-status-text" style={{ color: "#555" }}>Your submission is currently under review!</span>
                              </div>
                              <span className="following-post-timestamp">{new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            </div>
                            <div className="activity-post-body">
                              <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>We'll email you when we've made our edits and additions.</p>
                              <p className="activity-submitted-label">You submitted:</p>
                              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem", marginBottom: "0.3rem" }}>
                                <X size={13} style={{ color: "#e53e3e", flexShrink: 0, marginTop: "3px" }} />
                                <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }} data-testid={`notif-myth-${s.id}`}>"{s.mythHeader}"</p>
                              </div>
                              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                                <Check size={13} style={{ color: "#38a169", flexShrink: 0, marginTop: "3px" }} />
                                <p style={{ margin: 0, fontSize: "0.9rem" }} data-testid={`notif-truth-${s.id}`}>{s.truthHeader}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {mySubmissions.filter(s => s.status === "published").map(s => (
                        <div key={`notif-pub-${s.id}`} className="activity-post" data-testid={`notif-published-${s.id}`}>
                          <div className="activity-post-icon-col">
                            <CircleCheckBig size={40} strokeWidth={1.5} className="activity-status-icon activity-status-approved" />
                          </div>
                          <div className="activity-post-main">
                            <div className="activity-post-header">
                              <div className="activity-post-header-text">
                                <span className="activity-status-text activity-status-text-approved">Your submission has been published!</span>
                              </div>
                              <span className="following-post-timestamp">{new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            </div>
                            <div className="activity-post-body">
                              <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>"{s.mythHeader}"</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {mySubmissions.filter(s => s.status === "rejected").map(s => (
                        <div key={`notif-rej-${s.id}`} className="activity-post" data-testid={`notif-rejected-${s.id}`}>
                          <div className="activity-post-icon-col">
                            <MonitorX size={40} strokeWidth={1.5} className="activity-status-icon activity-status-denied" />
                          </div>
                          <div className="activity-post-main">
                            <div className="activity-post-header">
                              <div className="activity-post-header-text">
                                <span className="activity-status-text activity-status-text-denied">Your post submission was not approved.</span>
                              </div>
                              <span className="following-post-timestamp">{new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            </div>
                            <div className="activity-post-body">
                              <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>"{s.mythHeader}"</p>
                              {s.adminNote && (
                                <div className="activity-admin-feedback" data-testid={`notif-admin-note-${s.id}`}>
                                  <p className="activity-admin-feedback-text">{s.adminNote}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Live poll vote notifications */}
                      {myPollVotes.map((vote) => (
                        <div key={`notif-poll-${vote.id}`} className="following-post" data-testid={`notif-poll-${vote.id}`}>
                          <img
                            src={user?.profilePhoto || placeholderPhoto}
                            alt={user?.username || "You"}
                            className="following-post-avatar"
                          />
                          <div className="following-post-main">
                            <div className="following-post-header">
                              <div className="following-post-header-text">
                                <span className="following-post-username">{user?.username || "You"}</span>
                                <span className="following-post-action">voted on a poll</span>
                              </div>
                              <span className="following-post-timestamp" data-testid={`notif-poll-time-${vote.id}`}>
                                {(() => {
                                  const diff = Date.now() - new Date(vote.votedAt).getTime();
                                  const m = Math.floor(diff / 60000);
                                  if (m < 1) return "just now";
                                  if (m < 60) return `${m} min ago`;
                                  const h = Math.floor(m / 60);
                                  if (h < 24) return `${h}h ago`;
                                  const d = Math.floor(h / 24);
                                  if (d < 30) return `${d}d ago`;
                                  return new Date(vote.votedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                                })()}
                              </span>
                            </div>
                            <div className="following-post-body">
                              <div className="following-post-body-content">
                                <div className="following-post-body-left">
                                  <Link href={`/fact/${vote.factSlug}`} className="following-post-link">
                                    <p className="fact-myth" data-testid={`notif-poll-fact-${vote.id}`}>"{vote.factTitle}"</p>
                                  </Link>
                                  <div className="following-poll-response" data-testid={`notif-poll-response-${vote.id}`}>
                                    <p className="following-poll-question">Were you taught this information?</p>
                                    <div className="following-poll-selection">
                                      <div className="following-poll-radio-filled" />
                                      <span className="following-poll-answer" data-testid={`notif-poll-answer-${vote.id}`}>{vote.optionChosen}</span>
                                    </div>
                                  </div>
                                </div>
                                {vote.factCoverPhoto && (
                                  <Link href={`/fact/${vote.factSlug}`} className="following-post-cover-link" data-testid={`notif-poll-cover-${vote.id}`}>
                                    <img src={vote.factCoverPhoto} alt="" className="following-post-cover-photo" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* 1. Username1 liked your comment on */}
                      <div className="activity-post" data-testid="activity-post-1">
                        <div className="activity-post-icon-col">
                          <img src={placeholderPhoto} alt="Username1" className="activity-post-avatar" />
                          <Heart size={20} className="activity-type-icon activity-type-heart" />
                        </div>
                        <div className="activity-post-main">
                          <div className="activity-post-header">
                            <div className="activity-post-header-text">
                              <Link href="/user/Username1" className="following-post-username" data-testid="link-user-Username1">Username1</Link>
                              <span className="following-post-action">liked your comment on</span>
                            </div>
                            <span className="following-post-timestamp">2 mins ago</span>
                          </div>
                          <div className="activity-post-body">
                            <div className="following-post-body-content">
                              <div className="following-post-body-left">
                                <Link href="/fact/men-women-different-brains" className="following-post-link">
                                  <p className="fact-myth">"Men and women have very different brains."</p>
                                </Link>
                                <p className="following-plain-comment" data-testid="activity-comment-1">I was told this so many times by everybody growing up! I just thought it made sense because I saw so many differences in how men and women behaved. But the evidence is actually very clear that a lot of these distinctions come from socialization and not innate differences.</p>
                                <div className="comment-actions" data-testid="activity-comment-actions-1">
                                  <button className="comment-action" onClick={() => setActiveReplyId(activeReplyId === 'activity-1' ? null : 'activity-1')} data-testid="button-reply-activity-1">
                                    <CornerUpLeft size={14} />
                                    <span>Reply</span>
                                  </button>
                                  <button className="comment-action disabled-action" data-testid="button-like-activity-1">
                                    <Heart size={14} />
                                    <span>0 likes</span>
                                  </button>
                                  <button className="comment-action disabled-action" data-testid="button-edit-activity-1">
                                    <Pencil size={14} />
                                    <span>Edit</span>
                                  </button>
                                </div>
                                {activeReplyId === 'activity-1' && (
                                  <div className="inline-reply-box" data-testid="inline-reply-activity-1">
                                    <textarea placeholder="Write a reply..." data-testid="input-reply-activity-1" />
                                    <div className="inline-reply-actions">
                                      <button className="inline-reply-btn" data-testid="button-submit-reply-activity-1">Reply</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Link href="/fact/men-women-different-brains" className="following-post-cover-link" data-testid="cover-link-activity-1">
                                <img src="/uploads/1764732977459-366971984.png" alt="" className="following-post-cover-photo" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. Username2 commented on your submission */}
                      <div className="activity-post" data-testid="activity-post-2">
                        <div className="activity-post-icon-col">
                          <img src={placeholderPhoto} alt="Username2" className="activity-post-avatar" />
                          <MessageSquareMore size={20} className="activity-type-icon activity-type-comment" />
                        </div>
                        <div className="activity-post-main">
                          <div className="activity-post-header">
                            <div className="activity-post-header-text">
                              <Link href="/user/Username2" className="following-post-username" data-testid="link-user-Username2">Username2</Link>
                              <span className="following-post-action">commented on your submission</span>
                            </div>
                            <span className="following-post-timestamp">10 mins ago</span>
                          </div>
                          <div className="activity-post-body">
                            <div className="following-post-body-content">
                              <div className="following-post-body-left">
                                <Link href="/fact/swallow-spiders-in-sleep" className="following-post-link">
                                  <p className="fact-myth">"Humans swallow an average of 8 spiders in their sleep every year."</p>
                                </Link>
                                <p className="following-plain-comment" data-testid="activity-comment-2">Given how many spiders have crawled on me, I always believed this was true. I'm so happy to see it's been debunked. Although I have to admit, as someone who once woke up through an earthquake, I probably wouldn't wake up if a spider crawled on my face.</p>
                                <div className="comment-actions" data-testid="activity-comment-actions-2">
                                  <button className="comment-action" onClick={() => setActiveReplyId(activeReplyId === 'activity-2' ? null : 'activity-2')} data-testid="button-reply-activity-2">
                                    <CornerUpLeft size={14} />
                                    <span>Reply</span>
                                  </button>
                                  <button className="comment-action disabled-action" data-testid="button-like-activity-2">
                                    <Heart size={14} />
                                    <span>0 likes</span>
                                  </button>
                                  <button className="comment-action disabled-action" data-testid="button-save-activity-2">
                                    <Bookmark size={14} />
                                    <span>Save</span>
                                  </button>
                                  <div className="comment-ellipsis-wrapper">
                                    <button className="comment-action comment-ellipsis-btn" onClick={() => setActiveEllipsisId(activeEllipsisId === 'activity-2' ? null : 'activity-2')} data-testid="button-ellipsis-activity-2">
                                      <MoreHorizontal size={14} />
                                    </button>
                                    {activeEllipsisId === 'activity-2' && (
                                      <div className="comment-ellipsis-dropdown" data-testid="dropdown-ellipsis-activity-2">
                                        <button className="comment-ellipsis-item disabled-action" data-tooltip="Unavailable in beta" data-testid="button-follow-comment-activity-2">
                                          <BellPlus size={14} />
                                          <span>Follow comment</span>
                                        </button>
                                        <button className="comment-ellipsis-item disabled-action" data-tooltip="Unavailable in beta" data-testid="button-report-activity-2">
                                          <FlagTriangleRight size={14} />
                                          <span>Report</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {activeReplyId === 'activity-2' && (
                                  <div className="inline-reply-box" data-testid="inline-reply-activity-2">
                                    <textarea placeholder="Write a reply..." data-testid="input-reply-activity-2" />
                                    <div className="inline-reply-actions">
                                      <button className="inline-reply-btn" data-testid="button-submit-reply-activity-2">Reply</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Link href="/fact/swallow-spiders-in-sleep" className="following-post-cover-link" data-testid="cover-link-activity-2">
                                <img src="/uploads/1764995940108-220172306.jpg" alt="" className="following-post-cover-photo" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 3. Username3 started following you */}
                      <div className="activity-post" data-testid="activity-post-3">
                        <div className="activity-post-icon-col">
                          <img src={placeholderPhoto} alt="Username3" className="activity-post-avatar" />
                          <UserRoundPlus size={20} className="activity-type-icon activity-type-follow" />
                        </div>
                        <div className="activity-post-main">
                          <div className="activity-post-header">
                            <div className="activity-post-header-text">
                              <Link href="/user/Username3" className="following-post-username" data-testid="link-user-Username3">Username3</Link>
                              <span className="following-post-action">started following you</span>
                            </div>
                            <span className="following-post-timestamp">30 mins ago</span>
                          </div>
                          <div className="activity-post-body">
                            <button
                              className={`activity-follow-button${followedBack["Username3"] ? " activity-follow-button-following" : ""}`}
                              onClick={() => setFollowedBack(prev => ({ ...prev, Username3: !prev.Username3 }))}
                              data-testid="button-follow-back-Username3"
                            >
                              {followedBack["Username3"] ? "Following" : "Follow back"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 4. Your fact submission was approved! */}
                      <div className="activity-post" data-testid="activity-post-4">
                        <div className="activity-post-icon-col">
                          <CircleCheckBig size={40} strokeWidth={1.5} className="activity-status-icon activity-status-approved" />
                        </div>
                        <div className="activity-post-main">
                          <div className="activity-post-header">
                            <div className="activity-post-header-text">
                              <span className="activity-status-text activity-status-text-approved">Your submission has been published!</span>
                            </div>
                            <span className="following-post-timestamp">1 hour ago</span>
                          </div>
                          <div className="activity-post-body following-post-factcard">
                            <FactCard
                              fact={{
                                id: "columbus-americas",
                                category: "HISTORY",
                                categoryColor: "#D29E00",
                                myth: "Christopher Columbus discovered the Americas in 1492.",
                                truth: "Columbus only reached Central and South America where vast Indigenous civilizations had already established themselves over thousands of years.",
                                link: "/fact/christopher-columbus-discovered-americas",
                                coverPhoto: "/uploads/1764732977459-366971984.png",
                              }}
                              onSave={() => {}}
                              onShare={() => {}}
                              onComment={() => {}}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 5. Your edit request was approved! */}
                      <div className="activity-post" data-testid="activity-post-5">
                        <div className="activity-post-icon-col">
                          <CircleCheckBig size={40} strokeWidth={1.5} className="activity-status-icon activity-status-approved" />
                        </div>
                        <div className="activity-post-main">
                          <div className="activity-post-header">
                            <div className="activity-post-header-text">
                              <span className="activity-status-text activity-status-text-approved">Your edit request was approved!</span>
                            </div>
                            <span className="following-post-timestamp">2 hours ago</span>
                          </div>
                          <div className="activity-post-body">
                            <div className="following-post-body-content">
                              <div className="following-post-body-left">
                                <Link href="/fact/autism-broken-mirror-neurons" className="following-post-link">
                                  <p className="fact-myth">"Autism is caused by broken mirror neurons."</p>
                                </Link>
                                <p className="activity-submitted-label">You submitted:</p>
                                <p className="activity-submitted-text" data-testid="activity-submitted-5">Don't forget this: cite this 2020 study that further disproved it! Here's the study: https://pubmed.ncbi.nlm.nih.gov/30668956.</p>
                                <div className="activity-action-row">
                                  <Link href="/fact/autism-broken-mirror-neurons" className="activity-learn-more-button" data-testid="button-view-updated-entry-5">
                                    <img src={forwardArrow} alt="" className="activity-learn-more-arrow" />
                                    View updated entry
                                  </Link>
                                </div>
                              </div>
                              <Link href="/fact/autism-broken-mirror-neurons" className="following-post-cover-link" data-testid="cover-link-activity-5">
                                <img src="/uploads/1764995940108-220172306.jpg" alt="" className="following-post-cover-photo" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 6. Your edit request was not approved. */}
                      <div className="activity-post" data-testid="activity-post-6">
                        <div className="activity-post-icon-col">
                          <MonitorX size={40} strokeWidth={1.5} className="activity-status-icon activity-status-denied" />
                        </div>
                        <div className="activity-post-main">
                          <div className="activity-post-header">
                            <div className="activity-post-header-text">
                              <span className="activity-status-text activity-status-text-denied">Your edit request was not approved.</span>
                            </div>
                            <span className="following-post-timestamp">3 hours ago</span>
                          </div>
                          <div className="activity-post-body">
                            <div className="following-post-body-content">
                              <div className="following-post-body-left">
                                <Link href="/fact/people-repress-traumatic-memories" className="following-post-link">
                                  <p className="fact-myth">"People often repress traumatic memories."</p>
                                </Link>
                                <p className="activity-submitted-label">You submitted:</p>
                                <p className="activity-submitted-text" data-testid="activity-submitted-6">There's actually plenty of evidence that people do repress traumatic memories! I know it's a popular trope in the media. If it's that popular, it must be true, right?</p>
                                <div className="activity-action-row">
                                  <button className="activity-learn-more-button" data-testid="button-view-submission-6">
                                    <img src={forwardArrow} alt="" className="activity-learn-more-arrow" />
                                    View submission
                                  </button>
                                </div>
                              </div>
                              <Link href="/fact/people-repress-traumatic-memories" className="following-post-cover-link" data-testid="cover-link-activity-6">
                                <img src="/uploads/1764732977459-366971984.png" alt="" className="following-post-cover-photo" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 7. Your post submission was not approved (no cover photo) */}
                      <div className="activity-post" data-testid="activity-post-7">
                        <div className="activity-post-icon-col">
                          <MonitorX size={40} strokeWidth={1.5} className="activity-status-icon activity-status-denied" />
                        </div>
                        <div className="activity-post-main">
                          <div className="activity-post-header">
                            <div className="activity-post-header-text">
                              <span className="activity-status-text activity-status-text-denied">Your post submission was not approved.</span>
                            </div>
                            <span className="following-post-timestamp">5 hours ago</span>
                          </div>
                          <div className="activity-post-body">
                            <p className="activity-submitted-label">You submitted:</p>
                            <Link href="/fact/hard-work-always-success" className="following-post-link">
                              <p className="fact-myth">"Hard work will always result in success."</p>
                            </Link>
                            <div className="activity-submitted-revision">
                              <Check size={16} className="activity-revision-check" />
                              <p className="activity-truth-text">Success is so much more complicated than hard work. It's a mix of luck, family background, and education.</p>
                            </div>
                            <div className="activity-admin-feedback" data-testid="activity-admin-feedback-7">
                              <p className="activity-admin-feedback-text">This submission reads more like a personal opinion than a verifiable fact. The claims made are subjective in nature and cannot be objectively measured or tested. We encourage submissions that present commonly held beliefs alongside evidence-based corrections.</p>
                            </div>
                            <div className="activity-action-row">
                              <button className="activity-learn-more-button" data-testid="button-view-submission-7">
                                <img src={forwardArrow} alt="" className="activity-learn-more-arrow" />
                                View submission
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 8. Username5 replied to your comment on */}
                      <div className="activity-post" data-testid="activity-post-8">
                        <div className="activity-post-icon-col">
                          <img src={placeholderPhoto} alt="username5" className="activity-post-avatar" />
                          <MessageSquareMore size={20} className="activity-type-icon activity-type-comment" />
                        </div>
                        <div className="activity-post-main">
                          <div className="activity-post-header">
                            <div className="activity-post-header-text">
                              <Link href="/user/username5" className="following-post-username" data-testid="link-user-username5">username5</Link>
                              <span className="following-post-action">replied to your comment on</span>
                            </div>
                            <span className="following-post-timestamp">6 hours ago</span>
                          </div>
                          <div className="activity-post-body">
                            <div className="following-post-body-content">
                              <div className="following-post-body-left">
                                <Link href="/fact/swallow-spiders-in-sleep" className="following-post-link">
                                  <p className="fact-myth">"Humans swallow an average of 8 spiders in their sleep every year."</p>
                                </Link>
                                <div className="activity-comment-thread">
                                  <div className="activity-thread-comment">
                                    <div className="activity-thread-author">
                                      <span className="activity-thread-username">retrocodexadmin</span>
                                    </div>
                                    <div className="following-comment-quote">
                                      <p className="following-comment-text">I wonder where this myth originated if it was never Snopes this entire time. Growing up in California, I heard it around when I was 10, but haven't talked to anyone else from other states and countries about it.</p>
                                    </div>
                                  </div>
                                  <div className="activity-thread-comment">
                                    <div className="activity-thread-author">
                                      <span className="activity-thread-username">username5</span>
                                    </div>
                                    <p className="following-plain-comment">This myth had to have come from the US or one of the colder countries. Where I'm from, spiders are often massive. You would definitely feel them even if they're just a foot away, lol</p>
                                  </div>
                                </div>
                                <div className="comment-actions" data-testid="activity-comment-actions-8">
                                  <button className="comment-action" onClick={() => setActiveReplyId(activeReplyId === 'activity-8' ? null : 'activity-8')} data-testid="button-reply-activity-8">
                                    <CornerUpLeft size={14} />
                                    <span>Reply</span>
                                  </button>
                                  <button className="comment-action disabled-action" data-testid="button-like-activity-8">
                                    <Heart size={14} />
                                    <span>0 likes</span>
                                  </button>
                                  <button className="comment-action disabled-action" data-testid="button-save-activity-8">
                                    <Bookmark size={14} />
                                    <span>Save</span>
                                  </button>
                                </div>
                                {activeReplyId === 'activity-8' && (
                                  <div className="inline-reply-box" data-testid="inline-reply-activity-8">
                                    <textarea placeholder="Write a reply..." data-testid="input-reply-activity-8" />
                                    <div className="inline-reply-actions">
                                      <button className="inline-reply-btn" data-testid="button-submit-reply-activity-8">Reply</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Link href="/fact/swallow-spiders-in-sleep" className="following-post-cover-link" data-testid="cover-link-activity-8">
                                <img src="/uploads/1764995940108-220172306.jpg" alt="" className="following-post-cover-photo" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 9. An update was posted to a fact you follow */}
                      <div className="activity-post" data-testid="activity-post-9">
                        <div className="activity-post-icon-col">
                          <PlusCircle size={40} strokeWidth={1.5} className="activity-status-icon activity-status-update" />
                        </div>
                        <div className="activity-post-main">
                          <div className="activity-post-header">
                            <div className="activity-post-header-text">
                              <span className="activity-status-text">An update was posted to a fact you follow</span>
                            </div>
                            <span className="following-post-timestamp">1 day ago</span>
                          </div>
                          <div className="activity-post-body">
                            <div className="following-post-body-content">
                              <div className="following-post-body-left">
                                <Link href="/fact/food-pyramid-healthy-diet" className="following-post-link">
                                  <p className="fact-myth">"The Food Pyramid is the model for a healthy, balanced diet."</p>
                                </Link>
                                <p className="activity-submitted-label">Revision:</p>
                                <div className="activity-submitted-revision">
                                  <Check size={16} className="activity-revision-check" />
                                  <p className="activity-truth-text">In 2026, the US government introduced a new food pyramid that prioritized vegetables and protein while relegating grains to the bottom.</p>
                                </div>
                              </div>
                              <Link href="/fact/food-pyramid-healthy-diet" className="following-post-cover-link" data-testid="cover-link-activity-9">
                                <img src="/uploads/1764995940108-220172306.jpg" alt="" className="following-post-cover-photo" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {notificationsTab === "replies" && (
                    <div className="following-feed" data-testid="activity-feed-replies">

                      {/* Reply 1: username5 replied on spiders */}
                      <div className="activity-post" data-testid="reply-post-1">
                        <div className="activity-post-icon-col">
                          <img src={placeholderPhoto} alt="username5" className="activity-post-avatar" />
                          <MessageSquareMore size={20} className="activity-type-icon activity-type-comment" />
                        </div>
                        <div className="activity-post-main">
                          <div className="activity-post-header">
                            <div className="activity-post-header-text">
                              <Link href="/user/username5" className="following-post-username" data-testid="link-user-reply-username5">username5</Link>
                              <span className="following-post-action">replied to your comment on</span>
                            </div>
                            <span className="following-post-timestamp">6 hours ago</span>
                          </div>
                          <div className="activity-post-body">
                            <div className="following-post-body-content">
                              <div className="following-post-body-left">
                                <Link href="/fact/swallow-spiders-in-sleep" className="following-post-link">
                                  <p className="fact-myth">"Humans swallow an average of 8 spiders in their sleep every year."</p>
                                </Link>
                                <div className="activity-comment-thread">
                                  <div className="activity-thread-comment">
                                    <div className="activity-thread-author">
                                      <span className="activity-thread-username">retrocodexadmin</span>
                                    </div>
                                    <div className="following-comment-quote">
                                      <p className="following-comment-text">I wonder where this myth originated if it was never Snopes this entire time. Growing up in California, I heard it around when I was 10, but haven't talked to anyone else from other states and countries about it.</p>
                                    </div>
                                  </div>
                                  <div className="activity-thread-comment">
                                    <div className="activity-thread-author">
                                      <span className="activity-thread-username">username5</span>
                                    </div>
                                    <p className="following-plain-comment">This myth had to have come from the US or one of the colder countries. Where I'm from, spiders are often massive. You would definitely feel them even if they're just a foot away, lol</p>
                                  </div>
                                </div>
                                <div className="comment-actions" data-testid="reply-comment-actions-1">
                                  <button className="comment-action" onClick={() => setActiveReplyId(activeReplyId === 'reply-1' ? null : 'reply-1')} data-testid="button-reply-reply-1">
                                    <CornerUpLeft size={14} />
                                    <span>Reply</span>
                                  </button>
                                  <button className="comment-action disabled-action" data-testid="button-like-reply-1">
                                    <Heart size={14} />
                                    <span>0 likes</span>
                                  </button>
                                  <button className="comment-action disabled-action" data-testid="button-save-reply-1">
                                    <Bookmark size={14} />
                                    <span>Save</span>
                                  </button>
                                  <div className="comment-ellipsis-wrapper">
                                    <button className="comment-action comment-ellipsis-btn" onClick={() => setActiveEllipsisId(activeEllipsisId === 'reply-1' ? null : 'reply-1')} data-testid="button-ellipsis-reply-1">
                                      <MoreHorizontal size={14} />
                                    </button>
                                    {activeEllipsisId === 'reply-1' && (
                                      <div className="comment-ellipsis-dropdown" data-testid="dropdown-ellipsis-reply-1">
                                        <button className="comment-ellipsis-item disabled-action" data-tooltip="Unavailable in beta" data-testid="button-follow-comment-reply-1">
                                          <BellPlus size={14} />
                                          <span>Follow comment</span>
                                        </button>
                                        <button className="comment-ellipsis-item disabled-action" data-tooltip="Unavailable in beta" data-testid="button-report-reply-1">
                                          <FlagTriangleRight size={14} />
                                          <span>Report</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {activeReplyId === 'reply-1' && (
                                  <div className="inline-reply-box" data-testid="inline-reply-reply-1">
                                    <textarea placeholder="Write a reply..." data-testid="input-reply-reply-1" />
                                    <div className="inline-reply-actions">
                                      <button className="inline-reply-btn" data-testid="button-submit-reply-reply-1">Reply</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Link href="/fact/swallow-spiders-in-sleep" className="following-post-cover-link" data-testid="cover-link-reply-1">
                                <img src="/uploads/1764995940108-220172306.jpg" alt="" className="following-post-cover-photo" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reply 2: NightOwlNerd replied on carrots */}
                      <div className="activity-post" data-testid="reply-post-2">
                        <div className="activity-post-icon-col">
                          <img src={placeholderPhoto} alt="NightOwlNerd" className="activity-post-avatar" />
                          <MessageSquareMore size={20} className="activity-type-icon activity-type-comment" />
                        </div>
                        <div className="activity-post-main">
                          <div className="activity-post-header">
                            <div className="activity-post-header-text">
                              <Link href="/user/NightOwlNerd" className="following-post-username" data-testid="link-user-reply-NightOwlNerd">NightOwlNerd</Link>
                              <span className="following-post-action">replied to your comment on</span>
                            </div>
                            <span className="following-post-timestamp">2 days ago</span>
                          </div>
                          <div className="activity-post-body">
                            <div className="following-post-body-content">
                              <div className="following-post-body-left">
                                <Link href="/fact/does-eating-carrots-make-you-see-better" className="following-post-link">
                                  <p className="fact-myth">"Eating carrots will give you better eyesight."</p>
                                </Link>
                                <div className="activity-comment-thread">
                                  <div className="activity-thread-comment">
                                    <div className="activity-thread-author">
                                      <span className="activity-thread-username">retrocodexadmin</span>
                                    </div>
                                    <div className="following-comment-quote">
                                      <p className="following-comment-text">The British literally invented this myth during WWII to hide their radar technology. They told everyone their pilots could see in the dark because they ate carrots. It was wartime propaganda!</p>
                                    </div>
                                  </div>
                                  <div className="activity-thread-comment">
                                    <div className="activity-thread-author">
                                      <span className="activity-thread-username">NightOwlNerd</span>
                                    </div>
                                    <p className="following-plain-comment">That's wild. My mom used to force me to eat carrots as a kid specifically for my eyesight. Decades of propaganda working perfectly, I guess. Though I still love carrots, just not for that reason anymore.</p>
                                  </div>
                                </div>
                                <div className="comment-actions" data-testid="reply-comment-actions-2">
                                  <button className="comment-action" onClick={() => setActiveReplyId(activeReplyId === 'reply-2' ? null : 'reply-2')} data-testid="button-reply-reply-2">
                                    <CornerUpLeft size={14} />
                                    <span>Reply</span>
                                  </button>
                                  <button className="comment-action disabled-action" data-testid="button-like-reply-2">
                                    <Heart size={14} />
                                    <span>0 likes</span>
                                  </button>
                                  <button className="comment-action disabled-action" data-testid="button-save-reply-2">
                                    <Bookmark size={14} />
                                    <span>Save</span>
                                  </button>
                                  <div className="comment-ellipsis-wrapper">
                                    <button className="comment-action comment-ellipsis-btn" onClick={() => setActiveEllipsisId(activeEllipsisId === 'reply-2' ? null : 'reply-2')} data-testid="button-ellipsis-reply-2">
                                      <MoreHorizontal size={14} />
                                    </button>
                                    {activeEllipsisId === 'reply-2' && (
                                      <div className="comment-ellipsis-dropdown" data-testid="dropdown-ellipsis-reply-2">
                                        <button className="comment-ellipsis-item disabled-action" data-tooltip="Unavailable in beta" data-testid="button-follow-comment-reply-2">
                                          <BellPlus size={14} />
                                          <span>Follow comment</span>
                                        </button>
                                        <button className="comment-ellipsis-item disabled-action" data-tooltip="Unavailable in beta" data-testid="button-report-reply-2">
                                          <FlagTriangleRight size={14} />
                                          <span>Report</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {activeReplyId === 'reply-2' && (
                                  <div className="inline-reply-box" data-testid="inline-reply-reply-2">
                                    <textarea placeholder="Write a reply..." data-testid="input-reply-reply-2" />
                                    <div className="inline-reply-actions">
                                      <button className="inline-reply-btn" data-testid="button-submit-reply-reply-2">Reply</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Link href="/fact/does-eating-carrots-make-you-see-better" className="following-post-cover-link" data-testid="cover-link-reply-2">
                                <img src="/objects/uploads/80ca466a-5bc8-4420-bcac-2ed39def2b3c.png" alt="" className="following-post-cover-photo" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {notificationsTab === "comments" && (
                    <div className="following-feed" data-testid="activity-feed-comments">

                      {/* Comment 1: Username2 commented on spiders submission */}
                      <div className="activity-post" data-testid="comment-post-1">
                        <div className="activity-post-icon-col">
                          <img src={placeholderPhoto} alt="Username2" className="activity-post-avatar" />
                          <MessageSquareMore size={20} className="activity-type-icon activity-type-comment" />
                        </div>
                        <div className="activity-post-main">
                          <div className="activity-post-header">
                            <div className="activity-post-header-text">
                              <Link href="/user/Username2" className="following-post-username" data-testid="link-user-comment-Username2">Username2</Link>
                              <span className="following-post-action">commented on your submission</span>
                            </div>
                            <span className="following-post-timestamp">10 mins ago</span>
                          </div>
                          <div className="activity-post-body">
                            <div className="following-post-body-content">
                              <div className="following-post-body-left">
                                <Link href="/fact/swallow-spiders-in-sleep" className="following-post-link">
                                  <p className="fact-myth">"Humans swallow an average of 8 spiders in their sleep every year."</p>
                                </Link>
                                <p className="following-plain-comment" data-testid="comment-text-1">Given how many spiders have crawled on me, I always believed this was true. I'm so happy to see it's been debunked. Although I have to admit, as someone who once woke up through an earthquake, I probably wouldn't wake up if a spider crawled on my face.</p>
                                <div className="comment-actions" data-testid="comment-tab-actions-1">
                                  <button className="comment-action" onClick={() => setActiveReplyId(activeReplyId === 'comment-tab-1' ? null : 'comment-tab-1')} data-testid="button-reply-comment-tab-1">
                                    <CornerUpLeft size={14} />
                                    <span>Reply</span>
                                  </button>
                                  <button className="comment-action disabled-action" data-testid="button-like-comment-tab-1">
                                    <Heart size={14} />
                                    <span>0 likes</span>
                                  </button>
                                  <button className="comment-action disabled-action" data-testid="button-save-comment-tab-1">
                                    <Bookmark size={14} />
                                    <span>Save</span>
                                  </button>
                                  <div className="comment-ellipsis-wrapper">
                                    <button className="comment-action comment-ellipsis-btn" onClick={() => setActiveEllipsisId(activeEllipsisId === 'comment-tab-1' ? null : 'comment-tab-1')} data-testid="button-ellipsis-comment-tab-1">
                                      <MoreHorizontal size={14} />
                                    </button>
                                    {activeEllipsisId === 'comment-tab-1' && (
                                      <div className="comment-ellipsis-dropdown" data-testid="dropdown-ellipsis-comment-tab-1">
                                        <button className="comment-ellipsis-item disabled-action" data-tooltip="Unavailable in beta" data-testid="button-follow-comment-comment-tab-1">
                                          <BellPlus size={14} />
                                          <span>Follow comment</span>
                                        </button>
                                        <button className="comment-ellipsis-item disabled-action" data-tooltip="Unavailable in beta" data-testid="button-report-comment-tab-1">
                                          <FlagTriangleRight size={14} />
                                          <span>Report</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {activeReplyId === 'comment-tab-1' && (
                                  <div className="inline-reply-box" data-testid="inline-reply-comment-tab-1">
                                    <textarea placeholder="Write a reply..." data-testid="input-reply-comment-tab-1" />
                                    <div className="inline-reply-actions">
                                      <button className="inline-reply-btn" data-testid="button-submit-reply-comment-tab-1">Reply</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Link href="/fact/swallow-spiders-in-sleep" className="following-post-cover-link" data-testid="cover-link-comment-1">
                                <img src="/uploads/1764995940108-220172306.jpg" alt="" className="following-post-cover-photo" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Comment 2: PixelPusher99 commented on vikings submission */}
                      <div className="activity-post" data-testid="comment-post-2">
                        <div className="activity-post-icon-col">
                          <img src={placeholderPhoto} alt="PixelPusher99" className="activity-post-avatar" />
                          <MessageSquareMore size={20} className="activity-type-icon activity-type-comment" />
                        </div>
                        <div className="activity-post-main">
                          <div className="activity-post-header">
                            <div className="activity-post-header-text">
                              <Link href="/user/PixelPusher99" className="following-post-username" data-testid="link-user-comment-PixelPusher99">PixelPusher99</Link>
                              <span className="following-post-action">commented on your submission</span>
                            </div>
                            <span className="following-post-timestamp">3 days ago</span>
                          </div>
                          <div className="activity-post-body">
                            <div className="following-post-body-content">
                              <div className="following-post-body-left">
                                <Link href="/fact/did-vikings-wear-horned-helmets" className="following-post-link">
                                  <p className="fact-myth">"Vikings wore horned helmets into battle."</p>
                                </Link>
                                <p className="following-plain-comment" data-testid="comment-text-2">I blame every movie and TV show I've ever watched for this one. They always show Vikings with those massive horns on their helmets. Turns out the horned helmet thing was invented by costume designers in the 1800s for operas. The actual helmets were pretty plain.</p>
                                <div className="comment-actions" data-testid="comment-tab-actions-2">
                                  <button className="comment-action" onClick={() => setActiveReplyId(activeReplyId === 'comment-tab-2' ? null : 'comment-tab-2')} data-testid="button-reply-comment-tab-2">
                                    <CornerUpLeft size={14} />
                                    <span>Reply</span>
                                  </button>
                                  <button className="comment-action disabled-action" data-testid="button-like-comment-tab-2">
                                    <Heart size={14} />
                                    <span>0 likes</span>
                                  </button>
                                  <button className="comment-action disabled-action" data-testid="button-save-comment-tab-2">
                                    <Bookmark size={14} />
                                    <span>Save</span>
                                  </button>
                                  <div className="comment-ellipsis-wrapper">
                                    <button className="comment-action comment-ellipsis-btn" onClick={() => setActiveEllipsisId(activeEllipsisId === 'comment-tab-2' ? null : 'comment-tab-2')} data-testid="button-ellipsis-comment-tab-2">
                                      <MoreHorizontal size={14} />
                                    </button>
                                    {activeEllipsisId === 'comment-tab-2' && (
                                      <div className="comment-ellipsis-dropdown" data-testid="dropdown-ellipsis-comment-tab-2">
                                        <button className="comment-ellipsis-item disabled-action" data-tooltip="Unavailable in beta" data-testid="button-follow-comment-comment-tab-2">
                                          <BellPlus size={14} />
                                          <span>Follow comment</span>
                                        </button>
                                        <button className="comment-ellipsis-item disabled-action" data-tooltip="Unavailable in beta" data-testid="button-report-comment-tab-2">
                                          <FlagTriangleRight size={14} />
                                          <span>Report</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {activeReplyId === 'comment-tab-2' && (
                                  <div className="inline-reply-box" data-testid="inline-reply-comment-tab-2">
                                    <textarea placeholder="Write a reply..." data-testid="input-reply-comment-tab-2" />
                                    <div className="inline-reply-actions">
                                      <button className="inline-reply-btn" data-testid="button-submit-reply-comment-tab-2">Reply</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Link href="/fact/did-vikings-wear-horned-helmets" className="following-post-cover-link" data-testid="cover-link-comment-2">
                                <img src="/objects/uploads/155b09a1-773c-4e60-a73d-5eab03cc71b9.jpg" alt="" className="following-post-cover-photo" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

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
                            <div className="submissions-empty" data-testid="submissions-empty">You haven't submitted any facts yet.</div>
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
                        {dummyActivityComments.length > 0 ? (
                          <div className="following-feed">
                            {dummyActivityComments.map((c) => (
                              <div className="public-comment-entry" key={c.id} data-testid={`activity-comment-${c.id}`}>
                                <div className="following-post-body-content">
                                  <div className="following-post-body-left">
                                    <Link href={c.factLink} className="following-post-link">
                                      <p className="fact-myth">"{c.factTitle}"</p>
                                    </Link>
                                    <p className="following-plain-comment" data-testid={`activity-comment-text-${c.id}`}>{c.comment}</p>
                                    <div className="comment-actions" data-testid={`activity-comment-actions-${c.id}`}>
                                      <button className="comment-action" onClick={() => setActiveReplyId(activeReplyId === c.id ? null : c.id)} data-testid={`button-reply-activity-comment-${c.id}`}>
                                        <CornerUpLeft size={14} />
                                        <span>Reply</span>
                                      </button>
                                      <button className="comment-action disabled-action" data-testid={`button-like-activity-comment-${c.id}`}>
                                        <Heart size={14} />
                                        <span>0 likes</span>
                                      </button>
                                      <button className="comment-action disabled-action" data-testid={`button-save-activity-comment-${c.id}`}>
                                        <Bookmark size={14} />
                                        <span>Save</span>
                                      </button>
                                      <div className="comment-ellipsis-wrapper">
                                        <button className="comment-action comment-ellipsis-btn" onClick={() => setActiveEllipsisId(activeEllipsisId === c.id ? null : c.id)} data-testid={`button-ellipsis-activity-comment-${c.id}`}>
                                          <MoreHorizontal size={14} />
                                        </button>
                                        {activeEllipsisId === c.id && (
                                          <div className="comment-ellipsis-dropdown" data-testid={`dropdown-ellipsis-activity-comment-${c.id}`}>
                                            <button className="comment-ellipsis-item" data-testid={`button-edit-activity-comment-${c.id}`}>
                                              <Pencil size={14} />
                                              <span>Edit</span>
                                            </button>
                                            <button className="comment-ellipsis-item" data-testid={`button-delete-activity-comment-${c.id}`}>
                                              <Trash2 size={14} />
                                              <span>Delete</span>
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {activeReplyId === c.id && (
                                      <div className="inline-reply-box" data-testid={`inline-reply-activity-comment-${c.id}`}>
                                        <textarea placeholder="Write a reply..." data-testid={`input-reply-activity-comment-${c.id}`} />
                                        <div className="inline-reply-actions">
                                          <button className="inline-reply-btn" data-testid={`button-submit-reply-activity-comment-${c.id}`}>Reply</button>
                                        </div>
                                      </div>
                                    )}
                                    <span className="public-comment-timestamp" data-testid={`activity-comment-time-${c.id}`}>{c.timestamp}</span>
                                  </div>
                                  <Link href={c.factLink} className="following-post-cover-link" data-testid={`cover-link-activity-comment-${c.id}`}>
                                    <img src={c.coverPhoto} alt="" className="following-post-cover-photo" />
                                  </Link>
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

                    {activityTab === "polls" && (
                      <div data-testid="activity-polls-content">
                        {pollVotesLoading ? (
                          <div className="dashboard-feed-empty" data-testid="activity-polls-loading">
                            <p>Loading your poll votes...</p>
                          </div>
                        ) : myPollVotes.length > 0 ? (
                          <div className="following-feed">
                            {myPollVotes.map((vote) => (
                              <div className="public-comment-entry" key={vote.id} data-testid={`activity-poll-${vote.id}`}>
                                <div className="following-post-body-content">
                                  <div className="following-post-body-left">
                                    <Link href={`/fact/${vote.factSlug}`} className="following-post-link">
                                      <p className="fact-myth" data-testid={`poll-vote-fact-title-${vote.id}`}>"{vote.factTitle}"</p>
                                    </Link>
                                    <p className="following-plain-comment" data-testid={`poll-vote-answer-${vote.id}`}>
                                      <CircleCheck size={14} className="poll-vote-answer-icon" />
                                      Your answer: <strong>{vote.optionChosen}</strong>
                                    </p>
                                    {vote.locationChosen && (
                                      <p className="poll-vote-location-display" data-testid={`poll-vote-location-${vote.id}`}>
                                        <MapPinCheckInside size={14} className="poll-vote-location-icon" />
                                        I learned this in: {vote.locationChosen}
                                      </p>
                                    )}
                                    <span className="public-comment-timestamp" data-testid={`poll-vote-time-${vote.id}`}>
                                      {new Date(vote.votedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                  </div>
                                  {vote.factCoverPhoto && (
                                    <Link href={`/fact/${vote.factSlug}`} className="following-post-cover-link" data-testid={`cover-link-poll-${vote.id}`}>
                                      <img src={vote.factCoverPhoto} alt="" className="following-post-cover-photo" />
                                    </Link>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="dashboard-feed-empty" data-testid="activity-empty-polls">
                            <MessageSquare size={40} className="dashboard-feed-empty-icon" />
                            <p className="dashboard-feed-empty-title">You haven't answered any polls yet.</p>
                            <p className="dashboard-feed-empty-desc">
                              Visit a misconception page and answer the poll to see your responses here.
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
                          className={`notifications-tab${editRequestsTab === tab.id ? " notifications-tab-active" : ""}`}
                          onClick={() => setEditRequestsTab(tab.id)}
                          data-testid={`button-edit-requests-tab-${tab.id}`}
                        >
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="dashboard-feed-content" data-testid="dashboard-edit-requests-content">
                    {editRequestsTab === "pending" && (
                      <div className="following-feed" data-testid="edit-requests-pending">

                        {/* Pending edit request 1 */}
                        <div className="activity-post" data-testid="edit-request-pending-1">
                          <div className="activity-post-icon-col">
                            <Clock size={40} strokeWidth={1.5} className="activity-status-icon activity-status-pending" />
                          </div>
                          <div className="activity-post-main">
                            <div className="activity-post-header">
                              <div className="activity-post-header-text">
                                <Link href="/fact/breakfast-most-important-meal-of-the-day" className="following-post-link">
                                  <p className="fact-myth">"Breakfast is the most important meal of the day."</p>
                                </Link>
                              </div>
                              <span className="following-post-timestamp">5 hours ago</span>
                            </div>
                            <div className="activity-post-body">
                              <div className="following-post-body-content">
                                <div className="following-post-body-left">
                                  <p className="edit-section-label"><strong>Section editing:</strong> Sources</p>
                                  <p className="activity-submitted-label">You submitted:</p>
                                  <p className="activity-submitted-text" data-testid="edit-request-text-pending-1">You should add this 2024 meta-analysis that found no significant health benefits to eating breakfast vs. skipping it for healthy adults: https://pubmed.ncbi.nlm.nih.gov/example123/</p>
                                  <div className="activity-action-row">
                                    <button className="activity-learn-more-button" data-testid="button-view-submission-pending-1">
                                      <img src={forwardArrow} alt="" className="activity-learn-more-arrow" />
                                      View submission
                                    </button>
                                  </div>
                                </div>
                                <Link href="/fact/breakfast-most-important-meal-of-the-day" className="following-post-cover-link" data-testid="cover-link-edit-pending-1">
                                  <img src="/uploads/1764995940108-220172306.jpg" alt="" className="following-post-cover-photo" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {editRequestsTab === "approved" && (
                      <div className="following-feed" data-testid="edit-requests-approved">

                        {/* Approved edit request 1: Autism - Timeline */}
                        <div className="activity-post" data-testid="edit-request-approved-1">
                          <div className="activity-post-icon-col">
                            <CircleCheckBig size={40} strokeWidth={1.5} className="activity-status-icon activity-status-approved" />
                          </div>
                          <div className="activity-post-main">
                            <div className="activity-post-header">
                              <div className="activity-post-header-text">
                                <Link href="/fact/autism-broken-mirror-neurons" className="following-post-link">
                                  <p className="fact-myth">"Autism is caused by broken mirror neurons."</p>
                                </Link>
                              </div>
                              <span className="following-post-timestamp">2 hours ago</span>
                            </div>
                            <div className="activity-post-body">
                              <div className="following-post-body-content">
                                <div className="following-post-body-left">
                                  <p className="edit-section-label"><strong>Section editing:</strong> Timeline</p>
                                  <p className="activity-submitted-label">You submitted:</p>
                                  <p className="activity-submitted-text" data-testid="edit-request-text-approved-1">Don't forget to cite this 2020 study that further disproved it! Here's the study: https://pubmed.ncbi.nlm.nih.gov/32668956/</p>
                                  <div className="activity-action-row">
                                    <Link href="/fact/autism-broken-mirror-neurons" className="activity-learn-more-button" data-testid="button-view-updated-entry-approved-1">
                                      <img src={forwardArrow} alt="" className="activity-learn-more-arrow" />
                                      View updated entry
                                    </Link>
                                  </div>
                                </div>
                                <Link href="/fact/autism-broken-mirror-neurons" className="following-post-cover-link" data-testid="cover-link-edit-approved-1">
                                  <img src="/uploads/1764995940108-220172306.jpg" alt="" className="following-post-cover-photo" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {editRequestsTab === "not-approved" && (
                      <div className="following-feed" data-testid="edit-requests-not-approved">

                        {/* Not approved edit request 1: Repressed memories - Current Understanding */}
                        <div className="activity-post" data-testid="edit-request-not-approved-1">
                          <div className="activity-post-icon-col">
                            <MonitorX size={40} strokeWidth={1.5} className="activity-status-icon activity-status-denied" />
                          </div>
                          <div className="activity-post-main">
                            <div className="activity-post-header">
                              <div className="activity-post-header-text">
                                <Link href="/fact/people-repress-traumatic-memories" className="following-post-link">
                                  <p className="fact-myth">"People often repress traumatic memories."</p>
                                </Link>
                              </div>
                              <span className="following-post-timestamp">3 hours ago</span>
                            </div>
                            <div className="activity-post-body">
                              <div className="following-post-body-content">
                                <div className="following-post-body-left">
                                  <p className="edit-section-label"><strong>Section editing:</strong> Current Understanding</p>
                                  <p className="activity-submitted-label">You submitted:</p>
                                  <p className="activity-submitted-text" data-testid="edit-request-text-not-approved-1">There's actually plenty of evidence that people do repress traumatic memories! I know it's a popular trope in the media. If it's that popular, it must be true, right?</p>
                                  <div className="activity-action-row">
                                    <button className="activity-learn-more-button" data-testid="button-view-submission-not-approved-1">
                                      <img src={forwardArrow} alt="" className="activity-learn-more-arrow" />
                                      View submission
                                    </button>
                                  </div>
                                </div>
                                <Link href="/fact/people-repress-traumatic-memories" className="following-post-cover-link" data-testid="cover-link-edit-not-approved-1">
                                  <img src="/uploads/1764732977459-366971984.png" alt="" className="following-post-cover-photo" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}
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

                  {(savedTab === "all" || savedTab === "facts") && (
                    <div className="saved-facts-row" data-testid="saved-facts-row">
                      {savedFactsLoading ? (
                        <p className="saved-empty-message" data-testid="text-saved-facts-loading">Loading saved facts...</p>
                      ) : savedFactItems.length === 0 && savedTab === "facts" ? (
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
                            onBetaClick={() => {}}
                          />
                        ))
                      )}
                    </div>
                  )}

                  {(savedTab === "all" || savedTab === "articles") && (
                    <div className="saved-article-row" data-testid="saved-article-row">
                      {savedArticlesLoading ? (
                        <p className="saved-empty-message" data-testid="text-saved-articles-loading">Loading saved articles...</p>
                      ) : savedArticleItems.length === 0 && savedTab === "articles" ? (
                        <p className="saved-empty-message" data-testid="text-saved-articles-empty">No saved articles yet. Bookmark articles on the Articles page to see them here.</p>
                      ) : (
                        savedArticleItems.map((article) => (
                          <FeedArticleCard
                            key={article.id}
                            title={article.title}
                            summary={article.summary}
                            coverImage={article.coverImage}
                            category={article.category}
                            slug={article.slug}
                            externalUrl={article.articleType === "external" ? article.externalUrl : undefined}
                            isSaved={true}
                            onUnsave={() => unsaveArticleMutation.mutate(article.articleKey)}
                          />
                        ))
                      )}
                    </div>
                  )}

                  {(savedTab === "all" || savedTab === "comments") && (
                    <div className="saved-comment" data-testid="saved-comment-1">
                      <div className="following-post-body-content">
                        <div className="following-post-body-left">
                          <Link href="/fact/christopher-columbus-discovered-americas" className="following-post-link">
                            <p className="fact-myth">"Christopher Columbus discovered the Americas in 1492"</p>
                          </Link>
                          <div className="saved-comment-meta" data-testid="saved-comment-meta-1">
                            <Link href="/user/Ackshually_42" className="saved-comment-username" data-testid="link-saved-user-Ackshually_42">Ackshually_42</Link>
                            <span className="saved-comment-action">commented</span>
                            <span className="saved-comment-dot">·</span>
                            <span className="saved-comment-time">3 hours ago</span>
                          </div>
                          <p className="following-plain-comment" data-testid="saved-comment-text-1">Ackshually, to be pedantic, the term 'discovery' is a Eurocentric misnomer. Not only were millions of Indigenous people already inhabitant of the land, but the Norse explorer Leif Erikson had already established a settlement at L'Anse aux Meadows nearly five centuries prior. Columbus didn't even set foot on the North American mainland during his 1492 voyage; he was strictly in the Caribbean.</p>
                          <div className="comment-actions" data-testid="saved-comment-actions-1">
                            <button className="comment-action" onClick={() => setActiveReplyId(activeReplyId === 'saved-1' ? null : 'saved-1')} data-testid="button-reply-saved-1">
                              <CornerUpLeft size={14} />
                              <span>Reply</span>
                            </button>
                            <button className="comment-action disabled-action" data-testid="button-like-saved-1">
                              <Heart size={14} />
                              <span>0 likes</span>
                            </button>
                            <button className="comment-action comment-action-unsave" data-testid="button-unsave-saved-1">
                              <Bookmark size={14} className="unsave-icon" />
                              <span>Unsave</span>
                            </button>
                            <div className="comment-ellipsis-wrapper">
                              <button className="comment-action comment-ellipsis-btn" onClick={() => setActiveEllipsisId(activeEllipsisId === 'saved-1' ? null : 'saved-1')} data-testid="button-ellipsis-saved-1">
                                <MoreHorizontal size={14} />
                              </button>
                              {activeEllipsisId === 'saved-1' && (
                                <div className="comment-ellipsis-dropdown" data-testid="dropdown-ellipsis-saved-1">
                                  <button className="comment-ellipsis-item disabled-action" data-tooltip="Unavailable in beta" data-testid="button-follow-comment-saved-1">
                                    <BellPlus size={14} />
                                    <span>Follow comment</span>
                                  </button>
                                  <button className="comment-ellipsis-item disabled-action" data-tooltip="Unavailable in beta" data-testid="button-report-saved-1">
                                    <FlagTriangleRight size={14} />
                                    <span>Report</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          {activeReplyId === 'saved-1' && (
                            <div className="inline-reply-box" data-testid="inline-reply-saved-1">
                              <textarea placeholder="Write a reply..." data-testid="input-reply-saved-1" />
                              <div className="inline-reply-actions">
                                <button className="inline-reply-btn" data-testid="button-submit-reply-saved-1">Reply</button>
                              </div>
                            </div>
                          )}
                        </div>
                        <Link href="/fact/christopher-columbus-discovered-americas" className="following-post-cover-link" data-testid="cover-link-saved-comment-1">
                          <img src="/uploads/1764732977459-366971984.png" alt="" className="following-post-cover-photo" />
                        </Link>
                      </div>
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
    </div>
  );
}
