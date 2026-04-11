import { X, Eye, EyeOff, MapPin, Plus, Minus, XCircle, RotateCcw, ArrowLeft } from "lucide-react";
import envelopeImage from "@assets/email_1774815930235.png";
import scrungyWavingImage from "@assets/scrungy_waving_signin_1775206753767.png";
import { useState, useRef, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { CATEGORIES } from "@shared/categories";
import { OTHER_SUBCATEGORIES } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { validateUsername } from "@/lib/usernameValidation";
import { createAvatar } from "@dicebear/core";
import { funEmoji, glass, icons, identicon, shapes } from "@dicebear/collection";
import "./SignInModal.css";

const AVATAR_STYLES = [funEmoji, glass, icons, identicon, shapes];

function generateRandomAvatar(): string {
  const style = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
  const seed = Math.random().toString(36).slice(2, 10);
  return createAvatar(style, { seed }).toDataUri();
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

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  testId: string;
}

function CountrySelect({ value, onChange, placeholder = "Search country...", testId }: CountrySelectProps) {
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

interface StateSelectProps {
  value: string;
  onChange: (value: string) => void;
  testId: string;
}

function StateSelect({ value, onChange, testId }: StateSelectProps) {
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

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  customTitle?: string;
  onSuccessRedirect?: string;
  contextMessage?: string;
  googleSetupMode?: boolean;
}

type ModalScreen = "auth" | "locationSetup" | "topicSelection" | "emailVerification" | "googleUsernameSetup";

interface OtherCountryEntry {
  country: string;
  usState: string;
}

type TagsByCategory = Record<string, Record<string, string[]>>;

export function SignInModal({ isOpen, onClose, customTitle, onSuccessRedirect, contextMessage, googleSetupMode }: SignInModalProps) {
  const { login, register, refetchUser } = useAuth();
  const [currentPath, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [screen, setScreen] = useState<ModalScreen>("auth");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isGoogleFlow, setIsGoogleFlow] = useState(false);

  useEffect(() => {
    if (isOpen && googleSetupMode) {
      setIsGoogleFlow(true);
      setScreen("googleUsernameSetup");
    }
  }, [isOpen, googleSetupMode]);

  const [residenceCountry, setResidenceCountry] = useState("");
  const [residenceUsState, setResidenceUsState] = useState("");
  const [featureResidence, setFeatureResidence] = useState(false);
  const [otherCountries, setOtherCountries] = useState<OtherCountryEntry[]>([
    { country: "", usState: "" },
  ]);
  const [featureOtherCountries, setFeatureOtherCountries] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: tagsByCategory } = useQuery<TagsByCategory>({
    queryKey: ["/api/facts/tags-by-category"],
    enabled: screen === "topicSelection",
  });

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (value && password && value !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (value.length > 0) {
      setUsernameError(validateUsername(value));
    } else {
      setUsernameError(null);
    }
  };

  const handleEmailBlur = async () => {
    if (!isSignUp || !email.trim()) return;
    setIsCheckingEmail(true);
    try {
      const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      setEmailError(data.exists ? "An account with this email already exists." : null);
    } catch {
      setEmailError(null);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (isSignUp && password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }
    if (isSignUp) {
      if (usernameError !== null || username.trim() === "") return;
      if (emailError) return;
      setScreen("locationSetup");
    } else {
      setIsSubmitting(true);
      const result = await login(email, password);
      setIsSubmitting(false);
      if (result.success) {
        handleClose();
        navigate(onSuccessRedirect ?? currentPath);
      } else {
        setLoginError(result.error || "Invalid email or password.");
      }
    }
  };

  const handleClose = () => {
    setScreen("auth");
    setUsernameError(null);
    setResidenceCountry("");
    setResidenceUsState("");
    setFeatureResidence(false);
    setOtherCountries([{ country: "", usState: "" }]);
    setFeatureOtherCountries(false);
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedTags([]);
    setIsGoogleFlow(false);
    setUsername("");
    setLoginError("");
    onClose();
  };

  const handleAddOtherCountry = () => {
    if (otherCountries.length < 5) {
      setOtherCountries([...otherCountries, { country: "", usState: "" }]);
    }
  };

  const handleRemoveOtherCountry = (index: number) => {
    setOtherCountries(otherCountries.filter((_, i) => i !== index));
  };

  const handleOtherCountryChange = (index: number, country: string) => {
    const updated = [...otherCountries];
    updated[index] = { country, usState: country === "United States" ? updated[index].usState : "" };
    setOtherCountries(updated);
  };

  const handleOtherStateChange = (index: number, usState: string) => {
    const updated = [...otherCountries];
    updated[index] = { ...updated[index], usState };
    setOtherCountries(updated);
  };

  const toggleCategory = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? [] : [catName]
    );
  };

  const toggleSubcategory = (sub: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 20) return prev;
      return [...prev, tag];
    });
  };

  const getVisibleTags = (): string[] => {
    if (!tagsByCategory) return [];
    const tagsSet = new Set<string>();

    for (const catName of selectedCategories) {
      const catKey = Object.keys(tagsByCategory).find(
        (k) => k.toLowerCase() === catName.toLowerCase()
      );
      if (catKey && tagsByCategory[catKey]) {
        const allTags = tagsByCategory[catKey]._all || [];
        allTags.forEach((t) => tagsSet.add(t));
      }
    }

    for (const sub of selectedSubcategories) {
      for (const catKey of Object.keys(tagsByCategory)) {
        if (tagsByCategory[catKey][sub]) {
          tagsByCategory[catKey][sub].forEach((t) => tagsSet.add(t));
        }
      }
    }

    return Array.from(tagsSet).sort();
  };

  const showOtherSubcategories = selectedCategories.some(
    (c) => c.toLowerCase() === "other"
  );

  const doRegisterAndVerify = async () => {
    setIsSubmitting(true);
    setLoginError("");
    const profilePhoto = generateRandomAvatar();
    const currentLocation = residenceCountry
      ? residenceUsState
        ? `${residenceUsState}, ${residenceCountry}`
        : residenceCountry
      : "";
    const placesLived = otherCountries
      .filter((c) => c.country)
      .map((c) => c.usState ? `${c.usState}, ${c.country}` : c.country);

    if (isGoogleFlow) {
      try {
        const res = await fetch("/api/auth/google/complete-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            username,
            avatarUrl: profilePhoto,
            currentLocation,
            showCurrentLocation: featureResidence,
            placesLived,
            showPlacesLived: featureOtherCountries,
            favoriteTags: selectedTags,
            misinfoSource: "",
            bio: "",
          }),
        });
        const data = await res.json();
        setIsSubmitting(false);
        if (res.ok) {
          await refetchUser();
          handleClose();
        } else {
          setLoginError(data.message || "Profile creation failed. Please try again.");
          if (res.status === 409) {
            setScreen("googleUsernameSetup");
          }
        }
      } catch {
        setIsSubmitting(false);
        setLoginError("Something went wrong. Please try again.");
      }
      return;
    }

    const result = await register({
      username: username || "UnlearnExplorer",
      email,
      password,
      avatarUrl: profilePhoto,
      currentLocation,
      showCurrentLocation: featureResidence,
      placesLived,
      showPlacesLived: featureOtherCountries,
      favoriteTags: selectedTags,
      misinfoSource: "",
      bio: "",
    });
    setIsSubmitting(false);
    if (result.success) {
      setScreen("emailVerification");
    } else {
      setLoginError(result.error || "Registration failed. Please try again.");
      setScreen("auth");
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setResendMessage("");
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setResendMessage("Email sent!");
        setResendCooldown(60);
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) { clearInterval(interval); return 0; }
            return prev - 1;
          });
        }, 1000);
      } else if (res.status === 429) {
        setResendMessage("Too many attempts. Please wait before trying again.");
        setResendCooldown(60);
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) { clearInterval(interval); return 0; }
            return prev - 1;
          });
        }, 1000);
      } else {
        setResendMessage(data.message || "Could not resend. Please try again.");
      }
    } catch {
      setResendMessage("Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="signin-overlay" onClick={handleOverlayClick} data-testid="signin-modal-overlay">
      <div className={`signin-modal${(screen === "topicSelection" || screen === "locationSetup") ? " signin-modal-wide" : ""}`} data-testid="signin-modal">
        <button
          className="signin-close"
          onClick={handleClose}
          data-testid="button-signin-close"
          aria-label="Close sign in"
        >
          <X size={20} />
        </button>

        <div className="signin-modal-body">
          {screen === "emailVerification" ? (
            <div className="signin-email-verification" data-testid="screen-email-verification">
              <img
                src={envelopeImage}
                alt="Verification email sent"
                className="signin-verify-envelope"
                data-testid="img-verify-envelope"
              />
              <h2 className="signin-confirmation-title signin-verify-title" data-testid="text-verify-heading">
                A verification email is now on its way to <span className="signin-verify-email">{email}</span>!
              </h2>
              <p className="signin-verify-body" data-testid="text-verify-body">
                If you don't see it within 5 minutes in your inbox or the spam folder, let's try again.
              </p>
              <button
                type="button"
                className="signin-resend-button"
                data-testid="button-resend-email"
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
              >
                <RotateCcw size={15} className="signin-resend-icon" />
                {isResending
                  ? "Sending…"
                  : resendCooldown > 0
                  ? `Resend email in ${resendCooldown}s`
                  : "Resend email"}
              </button>
              {resendMessage && (
                <p className="signin-verify-feedback" data-testid="text-resend-feedback">{resendMessage}</p>
              )}
            </div>
          ) : screen === "topicSelection" ? (
            <div className="signin-topic-selection" data-testid="screen-topic-selection">
              <button
                type="button"
                className="signin-back-button"
                onClick={() => setScreen("locationSetup")}
                data-testid="button-back-topics"
              >
                <ArrowLeft size={15} />
                Back
              </button>

              <h2 className="signin-confirmation-title" data-testid="text-topic-title">
                What are your favorite subjects?
              </h2>
              <p className="signin-topic-subtitle" data-testid="text-topic-subtitle">
                Selecting topics helps us personalize your feed.
              </p>

              <div className="signin-topic-section">
                <label className="signin-location-label">SELECT CATEGORIES</label>
                <div className="signin-topic-tiles" data-testid="topic-category-tiles">
                  {CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategories.includes(category.name);
                    return (
                      <button
                        key={category.name}
                        type="button"
                        className={`signin-topic-tile${isSelected ? " signin-topic-tile-selected" : ""}`}
                        style={{
                          backgroundColor: category.color,
                        }}
                        onClick={() => toggleCategory(category.name)}
                        data-testid={`button-category-${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <Icon size={16} strokeWidth={2.5} className="signin-topic-tile-icon" />
                        <span className="signin-topic-tile-name">{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {showOtherSubcategories && (
                <div className="signin-topic-section" data-testid="topic-subcategories">
                  <div className="signin-subcategory-links">
                    {OTHER_SUBCATEGORIES.map((sub) => {
                      const isSelected = selectedSubcategories.includes(sub);
                      return (
                        <button
                          key={sub}
                          type="button"
                          className={`signin-subcategory-link${isSelected ? " signin-subcategory-link-selected" : ""}`}
                          onClick={() => toggleSubcategory(sub)}
                          data-testid={`button-subcategory-${sub.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="signin-topic-section" data-testid="topic-tags-section">
                <div className="signin-topic-tags-header">
                  <label className="signin-location-label">SELECT SUBTOPICS (MAX 20 TOTAL)</label>
                  <span className="signin-tag-counter" data-testid="text-tag-counter">
                    {selectedTags.length}/20
                  </span>
                </div>
                <div className="signin-topic-tags-container" data-testid="topic-tags-list">
                  {(selectedCategories.length > 0 || selectedSubcategories.length > 0) ? (
                    getVisibleTags().length > 0 ? (
                      <div className="signin-topic-tags">
                        {getVisibleTags().map((tag) => {
                          const isTagSelected = selectedTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              className={`signin-topic-tag-chip${isTagSelected ? " signin-topic-tag-chip-selected" : ""}`}
                              onClick={() => toggleTag(tag)}
                              data-testid={`button-tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              <span>{tag.toLowerCase()}</span>
                              {isTagSelected && (
                                <XCircle size={16} className="signin-tag-deselect" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="signin-topic-tags-empty">
                        No tags found for the selected categories yet.
                      </span>
                    )
                  ) : (
                    <span className="signin-topic-tags-placeholder">
                      Select categories to view topics
                    </span>
                  )}
                </div>
              </div>

              {loginError && (
                <p className="signin-error-text" style={{ textAlign: "center" }} data-testid="text-register-error">{loginError}</p>
              )}
              <div className="signin-bottom-actions">
                <button
                  type="button"
                  className="signin-submit-button"
                  data-testid="button-finish-onboarding"
                  disabled={isSubmitting}
                  onClick={doRegisterAndVerify}
                >
                  {isSubmitting ? "Creating account…" : "Finish"}
                </button>
                <button
                  type="button"
                  className="signin-skip-button-top"
                  data-testid="button-skip-topics"
                  onClick={doRegisterAndVerify}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating account…" : "Skip for now"}
                </button>
              </div>
            </div>
          ) : screen === "locationSetup" ? (
            <div className="signin-location-setup" data-testid="screen-location-setup">
              <button
                type="button"
                className="signin-back-button"
                onClick={() => setScreen("auth")}
                data-testid="button-back-location"
              >
                <ArrowLeft size={15} />
                Back
              </button>
              <h2 className="signin-confirmation-title" data-testid="text-location-title">
                <span className="signin-optional-tag">[Optional]</span>
                What we learn wrong often depends on where we're from.
              </h2>
              <p className="signin-description" data-testid="text-location-subtitle">
                Showing off where you're from gives users more insight into your shared stories and helps them identify wrongly taught topics specific to where they're from.
              </p>

              <div className="signin-location-section">
                <label className="signin-location-label">COUNTRY OF RESIDENCE</label>
                {residenceCountry === "United States" ? (
                  <div className="edit-profile-location-inline-row">
                    <div className="edit-profile-location-inline-field">
                      <StateSelect
                        value={residenceUsState}
                        onChange={setResidenceUsState}
                        testId="input-residence-state"
                      />
                    </div>
                    <div className="edit-profile-location-inline-field">
                      <CountrySelect
                        value={residenceCountry}
                        onChange={(val) => {
                          setResidenceCountry(val);
                          if (val !== "United States") setResidenceUsState("");
                        }}
                        testId="input-residence-country"
                      />
                    </div>
                  </div>
                ) : (
                  <CountrySelect
                    value={residenceCountry}
                    onChange={(val) => {
                      setResidenceCountry(val);
                      if (val !== "United States") setResidenceUsState("");
                    }}
                    testId="input-residence-country"
                  />
                )}
                <div className="signin-checkbox-row">
                  <input
                    type="checkbox"
                    id="feature-residence"
                    checked={featureResidence}
                    onChange={(e) => setFeatureResidence(e.target.checked)}
                    data-testid="checkbox-feature-residence"
                  />
                  <label htmlFor="feature-residence">Feature this on my profile</label>
                </div>
              </div>

              <div className="signin-location-section">
                <label className="signin-location-label">OTHER COUNTRIES WHERE YOU'VE LIVED (MAX 5)</label>
                {otherCountries.map((entry, index) => (
                  <div key={index} className="signin-add-country-outer">
                    <div className="signin-add-country-row">
                      {entry.country === "United States" ? (
                        <div className="edit-profile-location-inline-row" style={{ flex: 1 }}>
                          <div className="edit-profile-location-inline-field">
                            <StateSelect
                              value={entry.usState}
                              onChange={(val) => handleOtherStateChange(index, val)}
                              testId={`input-other-state-${index}`}
                            />
                          </div>
                          <div className="edit-profile-location-inline-field">
                            <CountrySelect
                              value={entry.country}
                              onChange={(val) => handleOtherCountryChange(index, val)}
                              testId={`input-other-country-${index}`}
                            />
                          </div>
                        </div>
                      ) : (
                        <CountrySelect
                          value={entry.country}
                          onChange={(val) => handleOtherCountryChange(index, val)}
                          testId={`input-other-country-${index}`}
                        />
                      )}
                      {index === otherCountries.length - 1 && otherCountries.length < 5 && (
                        <button
                          type="button"
                          className="signin-add-remove-btn"
                          onClick={handleAddOtherCountry}
                          data-testid="button-add-country"
                          aria-label="Add another country"
                        >
                          <Plus size={18} />
                        </button>
                      )}
                      {otherCountries.length > 1 && (
                        <button
                          type="button"
                          className="signin-add-remove-btn"
                          onClick={() => handleRemoveOtherCountry(index)}
                          data-testid={`button-remove-country-${index}`}
                          aria-label="Remove country"
                        >
                          <Minus size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="signin-checkbox-row">
                  <input
                    type="checkbox"
                    id="feature-other-countries"
                    checked={featureOtherCountries}
                    onChange={(e) => setFeatureOtherCountries(e.target.checked)}
                    data-testid="checkbox-feature-other-countries"
                  />
                  <label htmlFor="feature-other-countries">Feature this on my profile</label>
                </div>
              </div>

              <div className="signin-bottom-actions">
                <button
                  type="button"
                  className="signin-submit-button"
                  onClick={() => setScreen("topicSelection")}
                  data-testid="button-next-step"
                >
                  Next step
                </button>
                <button
                  type="button"
                  className="signin-skip-button-top"
                  onClick={() => setScreen("topicSelection")}
                  data-testid="button-skip-location"
                >
                  Skip for now
                </button>
              </div>
            </div>
          ) : screen === "googleUsernameSetup" ? (
            <div className="signin-location-setup" data-testid="screen-google-username-setup">
              <img
                src={scrungyWavingImage}
                alt="Welcome to Retrocodex"
                className="signin-logo-signup"
                data-testid="img-signin-logo-google"
              />
              <h2 className="signin-confirmation-title" data-testid="text-google-username-title">
                Choose a username
              </h2>
              <p className="signin-description" data-testid="text-google-username-subtitle">
                No real names. Your username is public and can't be changed.
              </p>
              <div className="signin-field" style={{ marginTop: 16 }}>
                <label className="signin-label" htmlFor="google-username">USERNAME</label>
                <input
                  id="google-username"
                  type="text"
                  className="signin-input"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="Choose a username"
                  data-testid="input-google-username"
                  autoFocus
                />
                {usernameError && (
                  <p style={{ color: '#FF5353', fontSize: '12px', fontFamily: "'Public Sans', sans-serif", marginTop: '4px', marginBottom: 0 }} data-testid="text-google-username-error">
                    {usernameError}
                  </p>
                )}
              </div>
              {loginError && (
                <p className="signin-error-text" style={{ textAlign: "center", marginTop: 8 }} data-testid="text-google-setup-error">
                  {loginError}
                </p>
              )}
              <button
                type="button"
                className="signin-submit-button"
                data-testid="button-google-username-next"
                disabled={!!usernameError || username.trim().length < 3}
                onClick={() => {
                  if (!usernameError && username.trim().length >= 3) {
                    setLoginError("");
                    setScreen("locationSetup");
                  }
                }}
              >
                Next step
              </button>
            </div>
          ) : (
            <>
              {isSignUp ? (
                <img src={scrungyWavingImage} alt="Welcome to Retrocodex" className="signin-logo-signup" data-testid="img-signin-logo" />
              ) : (
                <img src={scrungyWavingImage} alt="Retrocodex" className="signin-logo" data-testid="img-signin-logo" />
              )}

              <p className="signin-description" data-testid="text-signin-description">
                {customTitle
                  ? customTitle
                  : isSignUp
                    ? "Create an account to save your favorite topics, be notified when they're updated, and leave comments sharing your experiences."
                    : "Log in to save your favorite topics, be notified when they're updated, and leave comments sharing your experiences."}
              </p>

              <form className="signin-form" onSubmit={handleSubmit}>
                {isSignUp && (
                  <div className="signin-field">
                    <label className="signin-label" htmlFor="signin-username">USERNAME</label>
                    <input
                      id="signin-username"
                      type="text"
                      className="signin-input"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="Choose a username"
                      data-testid="input-signin-username"
                    />
                    {usernameError && (
                      <p style={{ color: '#FF5353', fontSize: '12px', fontFamily: "'Public Sans', sans-serif", marginTop: '4px', marginBottom: 0 }} data-testid="text-username-error">
                        {usernameError}
                      </p>
                    )}
                  </div>
                )}

                <div className="signin-field">
                  <label className="signin-label" htmlFor="signin-email">
                    {isSignUp ? "EMAIL" : "EMAIL OR USERNAME"}
                  </label>
                  <input
                    id="signin-email"
                    type={isSignUp ? "email" : "text"}
                    className={`signin-input${emailError ? " signin-input-error" : ""}`}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(null); }}
                    onBlur={handleEmailBlur}
                    data-testid="input-signin-email"
                  />
                  {isCheckingEmail && (
                    <p style={{ color: '#999', fontSize: '12px', fontFamily: "'Public Sans', sans-serif", marginTop: '4px', marginBottom: 0 }}>
                      Checking…
                    </p>
                  )}
                  {emailError && !isCheckingEmail && (
                    <p style={{ color: '#FF5353', fontSize: '12px', fontFamily: "'Public Sans', sans-serif", marginTop: '4px', marginBottom: 0 }} data-testid="text-email-error">
                      {emailError}
                    </p>
                  )}
                </div>

                <div className="signin-field">
                  <label className="signin-label" htmlFor="signin-password">PASSWORD</label>
                  <div className="signin-password-wrapper">
                    <input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      className="signin-input signin-input-password"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      data-testid="input-signin-password"
                    />
                    <button
                      type="button"
                      className="signin-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-password"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {!isSignUp && (
                    <button
                      type="button"
                      className="signin-forgot"
                      data-testid="button-forgot-password"
                      onClick={() => { onClose(); navigate("/forgot-password"); }}
                    >
                      Reset password
                    </button>
                  )}
                </div>

                {isSignUp && (
                  <div className="signin-field">
                    <label className="signin-label" htmlFor="signin-confirm-password">CONFIRM PASSWORD</label>
                    <div className="signin-password-wrapper">
                      <input
                        id="signin-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        className={`signin-input signin-input-password${confirmPasswordError ? " signin-input-error" : ""}`}
                        value={confirmPassword}
                        onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                        data-testid="input-signin-confirm-password"
                      />
                      <button
                        type="button"
                        className="signin-password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        data-testid="button-toggle-confirm-password"
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {confirmPasswordError && (
                      <span className="signin-error-text" data-testid="text-confirm-password-error">
                        {confirmPasswordError}
                      </span>
                    )}
                  </div>
                )}

                {loginError && (
                  <p className="signin-error-text" data-testid="text-login-error">{loginError}</p>
                )}

                <button
                  type="submit"
                  className="signin-submit-button"
                  data-testid="button-signin-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (isSignUp ? "Creating account…" : "Signing in…") : (isSignUp ? "Sign up" : "Sign in")}
                </button>
              </form>

              <div className="signin-divider">
                <span className="signin-divider-line"></span>
                <span className="signin-divider-text">OR CONTINUE WITH</span>
                <span className="signin-divider-line"></span>
              </div>

              <div className="signin-social-buttons">
                <button
                  type="button"
                  className="signin-social-button"
                  data-testid="button-signin-google"
                  onClick={() => { window.location.href = "/api/auth/google"; }}
                >
                  <FcGoogle size={20} />
                  <span>Google</span>
                </button>
              </div>

              <button
                type="button"
                className="signin-toggle-mode"
                onClick={() => setIsSignUp(!isSignUp)}
                data-testid="button-toggle-signup"
              >
                {isSignUp ? "Already have an account? Sign in" : "Sign up for an account"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
