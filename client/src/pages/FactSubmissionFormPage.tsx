import { useState } from "react";
import { useLocation } from "wouter";
import { X, Check, BookOpen, Plus, Trash2 } from "lucide-react";
import squirrelSuccess from "@assets/Cheerful_squirrel_with_checkmark_sign_1776139374734.png";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import "./FactSubmissionFormPage.css";

const DECADES = ["1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"];

interface SourceEntry {
  value: string;
}

export default function FactSubmissionFormPage() {
  const { isLoggedIn, isLoading, user } = useAuth();
  const [, navigate] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [mythHeader, setMythHeader] = useState("");
  const [mythDetails, setMythDetails] = useState("");
  const [truthHeader, setTruthHeader] = useState("");
  const [truthDetails, setTruthDetails] = useState("");
  const [sources, setSources] = useState<SourceEntry[]>([{ value: "" }, { value: "" }]);
  const [learnedFrom, setLearnedFrom] = useState<string[]>([]);
  const [otherLearnedFrom, setOtherLearnedFrom] = useState("");
  const [otherChecked, setOtherChecked] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDecade, setSelectedDecade] = useState("");
  const [considerations, setConsiderations] = useState("");
  const [otherDetails, setOtherDetails] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [rateLimited, setRateLimited] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const locationOptions: string[] = [];
  if (user?.currentLocation) locationOptions.push(user.currentLocation);
  if (user?.placesLived?.length) {
    user.placesLived.forEach((p: string) => {
      if (p && !locationOptions.includes(p)) locationOptions.push(p);
    });
  }
  const hasLocations = isLoggedIn && locationOptions.length > 0;

  if (!isLoading && !isLoggedIn) {
    navigate("/submit");
    return null;
  }

  const hasValidSource = sources.some(s => s.value.trim().length >= 10);
  const canSubmit =
    !rateLimited &&
    mythHeader.trim().length >= 10 &&
    truthHeader.trim().length >= 10 &&
    hasValidSource &&
    !isSubmitting;

  const addSource = () => {
    if (sources.length < 10) {
      setSources([...sources, { value: "" }]);
    }
  };

  const removeSource = (index: number) => {
    if (sources.length > 1) {
      setSources(sources.filter((_, i) => i !== index));
    }
  };

  const toggleLearnedFrom = (option: string) => {
    setLearnedFrom(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const updateSource = (index: number, value: string) => {
    const updated = [...sources];
    updated[index] = { value };
    setSources(updated);
  };

  const resetForm = () => {
    setMythHeader("");
    setMythDetails("");
    setTruthHeader("");
    setTruthDetails("");
    setSources([{ value: "" }, { value: "" }]);
    setLearnedFrom([]);
    setOtherChecked(false);
    setOtherLearnedFrom("");
    setSelectedLocation("");
    setSelectedDecade("");
    setConsiderations("");
    setOtherDetails("");
    setSubmitError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    const validSources = sources
      .map(s => s.value.trim())
      .filter(s => s.length >= 1);

    try {
      await apiRequest("POST", "/api/submissions", {
        mythHeader: mythHeader.trim(),
        mythDetails: mythDetails.trim(),
        truthHeader: truthHeader.trim(),
        truthDetails: truthDetails.trim(),
        sources: validSources,
        considerations: considerations.trim(),
        otherDetails: otherDetails.trim(),
        learnedFrom: [
          ...learnedFrom,
          ...(otherChecked && otherLearnedFrom.trim() ? [`Other: ${otherLearnedFrom.trim()}`] : otherChecked ? ["Other"] : []),
        ],
        learnedLocation: selectedLocation || "",
        learnedDecade: selectedDecade || "",
      });

      resetForm();
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message.startsWith("429:")) {
        try {
          const jsonStr = message.slice(4).trim();
          const data = JSON.parse(jsonStr);
          setSubmitError(data.message || "You've reached the 5 submission limit for today. Try again tomorrow.");
        } catch {
          setSubmitError("You've reached the 5 submission limit for today. Try again tomorrow.");
        }
        setRateLimited(true);
      } else {
        setSubmitError("Submission failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fact-form-page">
      <SEO
        title="Submit a New Fact | Retrocodex"
        description="Submit a widely believed myth or misconception to Retrocodex for review."
      />
      <Header onMenuClick={() => setIsMenuOpen(true)} hideTagline />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav sticky />

      <main className="fact-form-main">
        <div className="fact-form-outer">
          <div className="fact-form-wrapper">

            {submitted ? (
              <div className="fact-form-success" data-testid="submission-success">
                <img src={squirrelSuccess} alt="" className="fact-form-success-img" />
                <h1 className="fact-form-success-title">Submission received!</h1>
                <p className="fact-form-success-body">
                  If your topic is approved, we'll reach out to you if we need any additional information or for you to confirm our editorial changes.
                </p>
                <div className="fact-form-success-actions">
                  <button
                    className="fact-form-submit-btn"
                    onClick={() => setSubmitted(false)}
                    data-testid="button-submit-another"
                  >
                    Submit another fact
                  </button>
                  <button
                    className="fact-form-secondary-btn"
                    onClick={() => navigate("/")}
                    data-testid="button-go-home"
                  >
                    Go to homepage
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="fact-form-title" data-testid="text-form-title">Submit a new fact</h1>
                <p className="fact-form-subtitle">
                  Fields marked with <span className="fact-form-required-star">*</span> are required. <a href="https://www.markdownguide.org/basic-syntax/">Markdown </a> is supported.</p>
                
                <p>At this time, timeline and photo submissions are not required. Retrocodex will add these details after your submission is approved. The edited draft will be sent to you for review.
                  </p>
                <br></br>
                <p>All submissions will be reviewed before publishing.
                  </p>
                <br></br>

                <form className="fact-form" onSubmit={handleSubmit} data-testid="fact-submission-form">

                  {/* Section 1: What You Learned (myth header) */}
                  <div className="fact-form-section">
                    <div className="fact-form-section-label">
                      <X className="fact-form-section-icon myth-icon" size={14} strokeWidth={2.5} />
                      <span className="fact-form-label-text">WHAT YOU LEARNED <span className="fact-form-required-star">*</span></span>
                    </div>
                    <p className="fact-form-field-hint">
                      The commonly believed claim, written the way you were taught. (e.g. "We only use 10% of our brains.")
                    </p>
                    <textarea
                      className="fact-form-textarea fact-form-textarea-header"
                      value={mythHeader}
                      onChange={e => setMythHeader(e.target.value)}
                      placeholder="The widely believed and taught claim is..."
                      maxLength={400}
                      data-testid="input-myth-header"
                    />
                    <span className="fact-form-char-count">{mythHeader.length}/400</span>
                  </div>

                  {/* Section 2: Myth Details */}
                  <div className="fact-form-section">
                    <div className="fact-form-section-label">
                      <X className="fact-form-section-icon myth-icon" size={14} strokeWidth={2.5} />
                      <span className="fact-form-label-text">DETAILS</span>
                    </div>
                    <p className="fact-form-field-hint">
                      Where this myth comes from and how it spread. 
                    </p>
                    <textarea
                      className="fact-form-textarea fact-form-textarea-details"
                      value={mythDetails}
                      onChange={e => setMythDetails(e.target.value)}
                      placeholder="e.g. This myth comes from a 1920s study that was later debunked."
                      maxLength={2000}
                      data-testid="input-myth-details"
                    />
                    <span className="fact-form-char-count">{mythDetails.length}/2000</span>
                  </div>

                  {/* Section: Where did you learn this? */}
                  <div className="fact-form-section">
                    <div className="fact-form-section-label">
                      <X className="fact-form-section-icon myth-icon" size={14} strokeWidth={2.5} />
                      <span className="fact-form-label-text">WHERE DID YOU LEARN THIS?</span>
                    </div>
                    <p className="fact-form-field-hint">
                      Select all that apply.
                    </p>
                    <div className="fact-form-checkboxes" data-testid="learned-from-checkboxes">
                      <div className="fact-form-checkboxes-row">
                        {["School", "Family", "Social Media", "News Media"].map(option => (
                          <label
                            key={option}
                            className={`fact-form-checkbox-label${learnedFrom.includes(option) ? " checked" : ""}`}
                            data-testid={`checkbox-learned-${option.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <input
                              type="checkbox"
                              className="fact-form-checkbox-input"
                              checked={learnedFrom.includes(option)}
                              onChange={() => toggleLearnedFrom(option)}
                            />
                            <span className="fact-form-checkbox-box" />
                            <span className="fact-form-checkbox-text">{option}</span>
                          </label>
                        ))}
                      </div>

                      <div className="fact-form-checkboxes-other-row">
                        <label
                          className={`fact-form-checkbox-label${otherChecked ? " checked" : ""}`}
                          data-testid="checkbox-learned-other"
                        >
                          <input
                            type="checkbox"
                            className="fact-form-checkbox-input"
                            checked={otherChecked}
                            onChange={() => setOtherChecked(prev => !prev)}
                          />
                          <span className="fact-form-checkbox-box" />
                          <span className="fact-form-checkbox-text">Other</span>
                        </label>
                        {otherChecked && (
                          <input
                            type="text"
                            className="fact-form-other-input"
                            value={otherLearnedFrom}
                            onChange={e => setOtherLearnedFrom(e.target.value)}
                            maxLength={300}
                            placeholder="Please specify..."
                            data-testid="input-learned-other"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section: Location & Decade */}
                  <div className="fact-form-section">
                    <div className="fact-form-section-label">
                      <X className="fact-form-section-icon myth-icon" size={14} strokeWidth={2.5} />
                      <span className="fact-form-label-text">WHERE & WHEN DID YOU LEARN IT?</span>
                    </div>
                    <p className="fact-form-field-hint">
                      Optional — helps us understand where misconceptions spread.
                    </p>
                    <div className="fact-form-location-row" data-testid="location-decade-section">
                      <div className="fact-form-location-col fact-form-location-col--wide">
                        <label className="fact-form-location-label" htmlFor="form-location-select">
                          I learned this in:
                        </label>
                        {hasLocations ? (
                          <>
                            <select
                              id="form-location-select"
                              className="fact-form-location-select"
                              value={selectedLocation}
                              onChange={e => setSelectedLocation(e.target.value)}
                              data-testid="select-form-location"
                            >
                              <option value="">---</option>
                              {locationOptions.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                              ))}
                            </select>
                            {locationOptions.length === 1 && (
                              <p className="fact-form-location-hint">
                                Learned this somewhere else?{" "}
                                <a href="/dashboard?editProfile=true" className="fact-form-location-hint-link">
                                  Add other locations to your profile
                                </a>
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="fact-form-location-hint">
                            <a href="/dashboard?editProfile=true" className="fact-form-location-hint-link">
                              Add locations to your profile
                            </a>{" "}to enable this field.
                          </p>
                        )}
                      </div>
                      <div className="fact-form-location-col fact-form-location-col--narrow">
                        <label className="fact-form-location-label" htmlFor="form-decade-select">
                          In this decade:
                        </label>
                        <select
                          id="form-decade-select"
                          className="fact-form-decade-select"
                          value={selectedDecade}
                          onChange={e => setSelectedDecade(e.target.value)}
                          data-testid="select-form-decade"
                        >
                          <option value="">---</option>
                          {DECADES.map(decade => (
                            <option key={decade} value={decade}>{decade}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Current Understanding (truth header) */}
                  <div className="fact-form-section">
                    <div className="fact-form-section-label">
                      <Check className="fact-form-section-icon truth-icon" size={14} strokeWidth={2.5} />
                      <span className="fact-form-label-text">CURRENT UNDERSTANDING AS OF 2026 <span className="fact-form-required-star">*</span></span>
                    </div>
                    <p className="fact-form-field-hint">
                      What data has proven thus far. (e.g. "We use nearly all of our brain's regions.")
                    </p>
                    <textarea
                      className="fact-form-textarea fact-form-textarea-header"
                      value={truthHeader}
                      onChange={e => setTruthHeader(e.target.value)}
                      
                      maxLength={400}
                      data-testid="input-truth-header"
                    />
                    <span className="fact-form-char-count">{truthHeader.length}/400</span>
                  </div>

                  {/* Section 4: Truth Details */}
                  <div className="fact-form-section">
                    <div className="fact-form-section-label">
                      <Check className="fact-form-section-icon truth-icon" size={14} strokeWidth={2.5} />
                      <span className="fact-form-label-text">DETAILS</span>
                    </div>
                    <p className="fact-form-field-hint">
                      How does today's understanding differ from the myth? 
                    </p>
                    <textarea
                      className="fact-form-textarea fact-form-textarea-details"
                      value={truthDetails}
                      onChange={e => setTruthDetails(e.target.value)}
                      
                      maxLength={2000}
                      data-testid="input-truth-details"
                    />
                    <span className="fact-form-char-count">{truthDetails.length}/2000</span>
                  </div>

                  {/* Section 5: Sources */}
                  <div className="fact-form-section">
                    <div className="fact-form-section-label">
                      <BookOpen className="fact-form-section-icon sources-icon" size={14} strokeWidth={2.5} />
                      <span className="fact-form-label-text">SOURCES <span className="fact-form-required-star">*</span></span>
                    </div>
                    <p className="fact-form-field-hint">
                      Provide at least one source supporting the truth. Include a citation and/or a link.
                    </p>

                    {sources.map((source, index) => (
                      <div className="fact-form-source-row" key={index} data-testid={`source-row-${index}`}>
                        <input
                          type="text"
                          className="fact-form-input fact-form-source-input"
                          value={source.value}
                          onChange={e => updateSource(index, e.target.value)}
                          placeholder="Link to scientific study or article"
                          data-testid={`input-source-citation-${index}`}
                        />
                        {sources.length > 1 && (
                          <button
                            type="button"
                            className="fact-form-remove-source"
                            onClick={() => removeSource(index)}
                            aria-label="Remove source"
                            data-testid={`button-remove-source-${index}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    ))}

                    {sources.length < 10 && (
                      <button
                        type="button"
                        className="fact-form-add-source"
                        onClick={addSource}
                        data-testid="button-add-source"
                      >
                        <Plus size={13} />
                        Add another source
                      </button>
                    )}
                  </div>

                  {/* Section 6: Considerations */}
                  <div className="fact-form-section">
                    <div className="fact-form-section-label">
                      <span className="fact-form-label-text">CONSIDERATIONS</span>
                    </div>
                    <p className="fact-form-field-hint">
                      Any nuances, caveats, public controversies, or counterpoints worth noting. 
                    </p>
                    <textarea
                      className="fact-form-textarea fact-form-textarea-details"
                      value={considerations}
                      onChange={e => setConsiderations(e.target.value)}
                      placeholder="Situations where the facts may not apply or where the misconception may be true"
                      maxLength={4000}
                      data-testid="input-considerations"
                    />
                    <span className="fact-form-char-count">{considerations.length}/4000</span>
                  </div>

                  {/* Section 7: Other Details */}
                  <div className="fact-form-section fact-form-section-last">
                    <div className="fact-form-section-label">
                      <span className="fact-form-label-text">OTHER DETAILS</span>
                    </div>
                    <p className="fact-form-field-hint">
                      Anything else you'd like us to know. 
                    </p>
                    <textarea
                      className="fact-form-textarea fact-form-textarea-details"
                      value={otherDetails}
                      onChange={e => setOtherDetails(e.target.value)}
                      placeholder="Additional details, context, or miscellaneous relevant information"
                      maxLength={4000}
                      data-testid="input-other-details"
                    />
                    <span className="fact-form-char-count">{otherDetails.length}/4000</span>
                    <br></br>
                  </div>

                  {submitError && (
                    <p className="fact-form-error" data-testid="text-submit-error">{submitError}</p>
                  )}

                  <div className="fact-form-actions">
                    <button
                      type="submit"
                      className={`fact-form-submit-btn${canSubmit ? "" : " disabled"}`}
                      disabled={!canSubmit}
                      data-testid="button-submit-form"
                    >
                      {isSubmitting ? "Submitting…" : "Submit fact for review"}
                    </button>
                    <p className="fact-form-submit-note">
                      You can submit up to 5 facts every 24 hours.
                    </p>
                  </div>

                </form>
              </>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
