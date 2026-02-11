import { X, Eye, EyeOff, Check, RefreshCw, MapPin, Plus, Minus, XCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { CATEGORIES } from "@shared/categories";
import { OTHER_SUBCATEGORIES } from "@shared/schema";
import logoImage from "@assets/retrocodex thicker logo beta.png";
import "./SignInModal.css";

const SAMPLE_COUNTRIES = [
  "Australia",
  "Brazil",
  "Canada",
  "France",
  "Germany",
  "India",
  "Japan",
  "Mexico",
  "Nigeria",
  "United Kingdom",
  "United States",
];

const SAMPLE_US_STATES = [
  "California",
  "Florida",
  "Georgia",
  "Illinois",
  "Massachusetts",
  "New York",
  "Ohio",
  "Pennsylvania",
  "Texas",
  "Washington",
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
}

type ModalScreen = "auth" | "emailConfirmation" | "locationSetup" | "topicSelection";
type CodeStatus = "idle" | "success" | "error";

interface OtherCountryEntry {
  country: string;
  usState: string;
}

type TagsByCategory = Record<string, Record<string, string[]>>;

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [screen, setScreen] = useState<ModalScreen>("auth");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeStatus, setCodeStatus] = useState<CodeStatus>("idle");
  const [resendMessage, setResendMessage] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }
    if (isSignUp) {
      setScreen("emailConfirmation");
      setCodeStatus("idle");
      setVerificationCode("");
    }
  };

  const handleCodeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(digitsOnly);
    setCodeStatus("idle");
  };

  const handleVerifyCode = () => {
    if (verificationCode === "123456") {
      setCodeStatus("success");
      setTimeout(() => {
        setScreen("locationSetup");
      }, 1000);
    } else {
      setCodeStatus("error");
    }
  };

  const handleResendCode = () => {
    setResendMessage("Code resent!");
    setVerificationCode("");
    setCodeStatus("idle");
    setTimeout(() => setResendMessage(""), 3000);
  };

  const handleClose = () => {
    setScreen("auth");
    setCodeStatus("idle");
    setVerificationCode("");
    setResendMessage("");
    setResidenceCountry("");
    setResidenceUsState("");
    setFeatureResidence(false);
    setOtherCountries([{ country: "", usState: "" }]);
    setFeatureOtherCountries(false);
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedTags([]);
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

  return (
    <div className="signin-overlay" onClick={handleOverlayClick} data-testid="signin-modal-overlay">
      <div className={`signin-modal${screen === "topicSelection" ? " signin-modal-wide" : ""}`} data-testid="signin-modal">
        <button
          className="signin-close"
          onClick={handleClose}
          data-testid="button-signin-close"
          aria-label="Close sign in"
        >
          <X size={20} />
        </button>

        <div className="signin-modal-body">
          {screen === "topicSelection" ? (
            <div className="signin-topic-selection" data-testid="screen-topic-selection">
              <button
                type="button"
                className="signin-skip-button-top"
                data-testid="button-skip-topics"
              >
                Skip for now
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

              <button
                type="button"
                className="signin-submit-button"
                data-testid="button-finish-onboarding"
              >
                Finish
              </button>
            </div>
          ) : screen === "locationSetup" ? (
            <div className="signin-location-setup" data-testid="screen-location-setup">
              <button
                type="button"
                className="signin-skip-button-top"
                onClick={() => setScreen("topicSelection")}
                data-testid="button-skip-location"
              >
                Skip for now
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
                <CountrySelect
                  value={residenceCountry}
                  onChange={(val) => {
                    setResidenceCountry(val);
                    if (val !== "United States") setResidenceUsState("");
                  }}
                  testId="input-residence-country"
                />
                {residenceCountry === "United States" && (
                  <div className="signin-state-field">
                    <label className="signin-location-label">STATE</label>
                    <StateSelect
                      value={residenceUsState}
                      onChange={setResidenceUsState}
                      testId="input-residence-state"
                    />
                  </div>
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
                  <div key={index}>
                    <div className="signin-add-country-row">
                      <CountrySelect
                        value={entry.country}
                        onChange={(val) => handleOtherCountryChange(index, val)}
                        testId={`input-other-country-${index}`}
                      />
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
                    {entry.country === "United States" && (
                      <div className="signin-state-field">
                        <label className="signin-location-label">STATE</label>
                        <StateSelect
                          value={entry.usState}
                          onChange={(val) => handleOtherStateChange(index, val)}
                          testId={`input-other-state-${index}`}
                        />
                      </div>
                    )}
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

              <button
                type="button"
                className="signin-submit-button"
                onClick={() => setScreen("topicSelection")}
                data-testid="button-next-step"
              >
                Next step
              </button>
            </div>
          ) : screen === "emailConfirmation" ? (
            <div className="signin-confirmation" data-testid="screen-email-confirmation">
              <h2 className="signin-confirmation-title" data-testid="text-confirmation-title">
                Enter the 6-digit code sent to your email.
              </h2>

              <div className="signin-code-field">
                <input
                  type="text"
                  inputMode="numeric"
                  className={`signin-code-input${codeStatus === "error" ? " signin-input-error" : ""}`}
                  value={verificationCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  data-testid="input-verification-code"
                />
              </div>

              {codeStatus === "success" && (
                <div className="signin-code-status signin-code-success" data-testid="text-code-success">
                  <Check size={20} className="signin-status-icon truth-icon" />
                  <span>Account created!</span>
                </div>
              )}

              {codeStatus === "error" && (
                <div className="signin-code-status signin-code-error" data-testid="text-code-error">
                  <X size={20} className="signin-status-icon myth-icon" />
                  <span>Incorrect code.</span>
                </div>
              )}

              <button
                type="button"
                className="signin-verify-button"
                onClick={handleVerifyCode}
                disabled={verificationCode.length !== 6 || codeStatus === "success"}
                data-testid="button-verify-code"
              >
                Verify
              </button>

              <button
                type="button"
                className="signin-resend-button"
                onClick={handleResendCode}
                disabled={codeStatus === "success"}
                data-testid="button-resend-code"
              >
                <RefreshCw size={14} className="signin-resend-icon" />
                Resend code
              </button>

              {resendMessage && (
                <span className="signin-resend-message" data-testid="text-resend-message">
                  {resendMessage}
                </span>
              )}
            </div>
          ) : (
            <>
              <img src={logoImage} alt="Retrocodex" className="signin-logo" data-testid="img-signin-logo" />

              <p className="signin-description" data-testid="text-signin-description">
                {isSignUp
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
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      data-testid="input-signin-username"
                    />
                  </div>
                )}

                <div className="signin-field">
                  <label className="signin-label" htmlFor="signin-email">
                    {isSignUp ? "EMAIL" : "EMAIL OR USERNAME"}
                  </label>
                  <input
                    id="signin-email"
                    type={isSignUp ? "email" : "text"}
                    className="signin-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-signin-email"
                  />
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

                <button
                  type="submit"
                  className="signin-submit-button"
                  data-testid="button-signin-submit"
                >
                  {isSignUp ? "Sign up" : "Sign in"}
                </button>
              </form>

              <div className="signin-divider">
                <span className="signin-divider-line"></span>
                <span className="signin-divider-text">OR LOG IN WITH</span>
                <span className="signin-divider-line"></span>
              </div>

              <div className="signin-social-buttons">
                <button
                  type="button"
                  className="signin-social-button"
                  data-testid="button-signin-google"
                >
                  <FcGoogle size={20} />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  className="signin-social-button"
                  data-testid="button-signin-apple"
                >
                  <FaApple size={20} />
                  <span>Apple</span>
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
