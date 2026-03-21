import { useState } from "react";
import { useLocation } from "wouter";
import { X, Check, BookOpen, Plus, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import "./FactSubmissionFormPage.css";

interface SourceEntry {
  value: string;
}

export default function FactSubmissionFormPage() {
  const { isLoggedIn, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [mythHeader, setMythHeader] = useState("");
  const [mythDetails, setMythDetails] = useState("");
  const [truthHeader, setTruthHeader] = useState("");
  const [truthDetails, setTruthDetails] = useState("");
  const [sources, setSources] = useState<SourceEntry[]>([{ value: "" }, { value: "" }]);
  const [considerations, setConsiderations] = useState("");
  const [otherDetails, setOtherDetails] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [rateLimited, setRateLimited] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      });

      resetForm();
      setSubmitted(true);
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
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav sticky />

      <main className="fact-form-main">
        <div className="fact-form-outer">
          <div className="fact-form-wrapper">

            {submitted ? (
              <div className="fact-form-success" data-testid="submission-success">
                <div className="fact-form-success-icon">
                  <Check size={36} strokeWidth={2.5} />
                </div>
                <h1 className="fact-form-success-title">Submission received!</h1>
                <p className="fact-form-success-body">
                  Thank you for your submission. Our team will review it and may reach out if we need more information. We appreciate your contribution to making Retrocodex more comprehensive.
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
                  Fields marked with <span className="fact-form-required-star">*</span> are required. Your submission will be reviewed before being published.
                </p>

                <form className="fact-form" onSubmit={handleSubmit} data-testid="fact-submission-form">

                  {/* Section 1: What You Learned (myth header) */}
                  <div className="fact-form-section">
                    <div className="fact-form-section-label">
                      <X className="fact-form-section-icon myth-icon" size={14} strokeWidth={2.5} />
                      <span className="fact-form-label-text">WHAT YOU LEARNED <span className="fact-form-required-star">*</span></span>
                    </div>
                    <p className="fact-form-field-hint">
                      The commonly believed claim — written as if it were true. (e.g. "We only use 10% of our brains.")
                    </p>
                    <textarea
                      className="fact-form-textarea fact-form-textarea-header"
                      value={mythHeader}
                      onChange={e => setMythHeader(e.target.value)}
                      placeholder="The widely believed claim..."
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
                      Explain where this myth comes from or how it spread. Markdown is supported.
                    </p>
                    <textarea
                      className="fact-form-textarea fact-form-textarea-details"
                      value={mythDetails}
                      onChange={e => setMythDetails(e.target.value)}
                      placeholder="Background on the myth..."
                      maxLength={2000}
                      data-testid="input-myth-details"
                    />
                    <span className="fact-form-char-count">{mythDetails.length}/2000</span>
                  </div>

                  {/* Section 3: Current Understanding (truth header) */}
                  <div className="fact-form-section">
                    <div className="fact-form-section-label">
                      <Check className="fact-form-section-icon truth-icon" size={14} strokeWidth={2.5} />
                      <span className="fact-form-label-text">CURRENT UNDERSTANDING AS OF 2026 <span className="fact-form-required-star">*</span></span>
                    </div>
                    <p className="fact-form-field-hint">
                      The corrected claim — the actual truth. (e.g. "We use virtually all of our brain's regions.")
                    </p>
                    <textarea
                      className="fact-form-textarea fact-form-textarea-header"
                      value={truthHeader}
                      onChange={e => setTruthHeader(e.target.value)}
                      placeholder="The actual truth..."
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
                      Explain the evidence behind the truth. Markdown is supported.
                    </p>
                    <textarea
                      className="fact-form-textarea fact-form-textarea-details"
                      value={truthDetails}
                      onChange={e => setTruthDetails(e.target.value)}
                      placeholder="Explain the evidence..."
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
                          placeholder="Link to scientific study or article."
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
                      Any nuances, caveats, or counterpoints worth noting. (Optional)
                    </p>
                    <textarea
                      className="fact-form-textarea fact-form-textarea-details"
                      value={considerations}
                      onChange={e => setConsiderations(e.target.value)}
                      placeholder="Edge cases or nuances..."
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
                      Anything else you'd like us to know. (Optional)
                    </p>
                    <textarea
                      className="fact-form-textarea fact-form-textarea-details"
                      value={otherDetails}
                      onChange={e => setOtherDetails(e.target.value)}
                      placeholder="Any additional context..."
                      maxLength={4000}
                      data-testid="input-other-details"
                    />
                    <span className="fact-form-char-count">{otherDetails.length}/4000</span>
                    <p className="fact-form-other-note">
                      If you have additional media, screenshots, or files relevant to this submission, you can email them to <span className="fact-form-email">submissions@retrocodex.com</span> with the subject line matching your myth header.
                    </p>
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
