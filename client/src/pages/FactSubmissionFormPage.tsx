import { useState } from "react";
import { useLocation } from "wouter";
import { X, Check, BookOpen, Plus, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/lib/auth";
import "./FactSubmissionFormPage.css";

interface SourceEntry {
  citation: string;
  link: string;
}

export default function FactSubmissionFormPage() {
  const { isLoggedIn, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [mythHeader, setMythHeader] = useState("");
  const [mythDetails, setMythDetails] = useState("");
  const [truthHeader, setTruthHeader] = useState("");
  const [truthDetails, setTruthDetails] = useState("");
  const [sources, setSources] = useState<SourceEntry[]>([{ citation: "", link: "" }]);
  const [considerations, setConsiderations] = useState("");
  const [otherDetails, setOtherDetails] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isLoading && !isLoggedIn) {
    navigate("/submit");
    return null;
  }

  const hasValidSource = sources.some(s => s.citation.trim().length >= 10);
  const canSubmit =
    mythHeader.trim().length >= 10 &&
    truthHeader.trim().length >= 10 &&
    hasValidSource &&
    !isSubmitting;

  const addSource = () => {
    if (sources.length < 10) {
      setSources([...sources, { citation: "", link: "" }]);
    }
  };

  const removeSource = (index: number) => {
    if (sources.length > 1) {
      setSources(sources.filter((_, i) => i !== index));
    }
  };

  const updateSource = (index: number, field: keyof SourceEntry, value: string) => {
    const updated = [...sources];
    updated[index] = { ...updated[index], [field]: value };
    setSources(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    const validSources = sources
      .filter(s => s.citation.trim().length >= 1)
      .map(s => s.link.trim() ? `${s.citation.trim()} — ${s.link.trim()}` : s.citation.trim());

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          mythHeader: mythHeader.trim(),
          mythDetails: mythDetails.trim(),
          truthHeader: truthHeader.trim(),
          truthDetails: truthDetails.trim(),
          sources: validSources,
          considerations: considerations.trim(),
          otherDetails: otherDetails.trim(),
        }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setSubmitError(data.message || "You have reached the submission limit for today. Please try again later.");
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.message || "Submission failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fact-form-page">
      <SEO
        title="Submit a Fact | Retrocodex"
        description="Submit a widely believed myth or misconception to Retrocodex for review."
      />
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav sticky />

      <main className="fact-form-main">
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
                  onClick={() => {
                    setSubmitted(false);
                    setMythHeader("");
                    setMythDetails("");
                    setTruthHeader("");
                    setTruthDetails("");
                    setSources([{ citation: "", link: "" }]);
                    setConsiderations("");
                    setOtherDetails("");
                  }}
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
              <h1 className="fact-form-title" data-testid="text-form-title">Submit a fact</h1>
              <p className="fact-form-subtitle">
                Fields marked with <span className="fact-form-required-star">*</span> are required. Your submission will be reviewed by our team before being published.
              </p>

              <form className="fact-form" onSubmit={handleSubmit} data-testid="fact-submission-form">

                <div className="fact-form-section">
                  <div className="fact-form-section-label">
                    <X className="fact-form-section-icon myth-icon" size={16} strokeWidth={2.5} />
                    <span className="fact-form-label-text">THE MYTH</span>
                  </div>

                  <div className="fact-form-field">
                    <label className="fact-form-field-label" htmlFor="myth-header">
                      MYTH HEADER <span className="fact-form-required-star">*</span>
                    </label>
                    <p className="fact-form-field-hint">
                      The commonly believed claim — written as if it were true. (e.g. "We only use 10% of our brains.")
                    </p>
                    <input
                      id="myth-header"
                      type="text"
                      className="fact-form-input"
                      value={mythHeader}
                      onChange={e => setMythHeader(e.target.value)}
                      placeholder="The widely believed claim..."
                      maxLength={275}
                      data-testid="input-myth-header"
                    />
                    <span className="fact-form-char-count">{mythHeader.length}/275</span>
                  </div>

                  <div className="fact-form-field">
                    <label className="fact-form-field-label" htmlFor="myth-details">
                      MYTH DETAILS
                    </label>
                    <p className="fact-form-field-hint">
                      Explain where this myth comes from or how it spread. Markdown is supported.
                    </p>
                    <textarea
                      id="myth-details"
                      className="fact-form-textarea"
                      value={mythDetails}
                      onChange={e => setMythDetails(e.target.value)}
                      placeholder="Background on the myth..."
                      rows={4}
                      data-testid="input-myth-details"
                    />
                  </div>
                </div>

                <div className="fact-form-section">
                  <div className="fact-form-section-label">
                    <Check className="fact-form-section-icon truth-icon" size={16} strokeWidth={2.5} />
                    <span className="fact-form-label-text">THE TRUTH</span>
                  </div>

                  <div className="fact-form-field">
                    <label className="fact-form-field-label" htmlFor="truth-header">
                      TRUTH HEADER <span className="fact-form-required-star">*</span>
                    </label>
                    <p className="fact-form-field-hint">
                      The corrected claim — the actual truth. (e.g. "We use virtually all of our brain's regions.")
                    </p>
                    <input
                      id="truth-header"
                      type="text"
                      className="fact-form-input"
                      value={truthHeader}
                      onChange={e => setTruthHeader(e.target.value)}
                      placeholder="The actual truth..."
                      maxLength={275}
                      data-testid="input-truth-header"
                    />
                    <span className="fact-form-char-count">{truthHeader.length}/275</span>
                  </div>

                  <div className="fact-form-field">
                    <label className="fact-form-field-label" htmlFor="truth-details">
                      TRUTH DETAILS
                    </label>
                    <p className="fact-form-field-hint">
                      Explain the evidence behind the truth. Markdown is supported.
                    </p>
                    <textarea
                      id="truth-details"
                      className="fact-form-textarea"
                      value={truthDetails}
                      onChange={e => setTruthDetails(e.target.value)}
                      placeholder="Explain the evidence..."
                      rows={4}
                      data-testid="input-truth-details"
                    />
                  </div>
                </div>

                <div className="fact-form-section">
                  <div className="fact-form-section-label">
                    <BookOpen className="fact-form-section-icon sources-icon" size={16} strokeWidth={2.5} />
                    <span className="fact-form-label-text">SOURCES</span>
                  </div>

                  <p className="fact-form-field-hint" style={{ marginBottom: "12px" }}>
                    Provide at least one source supporting the truth. Include the citation and optionally a link. <span className="fact-form-required-star">*</span>
                  </p>

                  {sources.map((source, index) => (
                    <div className="fact-form-source-row" key={index} data-testid={`source-row-${index}`}>
                      <div className="fact-form-source-fields">
                        <input
                          type="text"
                          className="fact-form-input"
                          value={source.citation}
                          onChange={e => updateSource(index, "citation", e.target.value)}
                          placeholder={`Source ${index + 1} citation (author, publication, year…)`}
                          data-testid={`input-source-citation-${index}`}
                        />
                        <input
                          type="url"
                          className="fact-form-input fact-form-input-url"
                          value={source.link}
                          onChange={e => updateSource(index, "link", e.target.value)}
                          placeholder="https://... (optional)"
                          data-testid={`input-source-link-${index}`}
                        />
                      </div>
                      {sources.length > 1 && (
                        <button
                          type="button"
                          className="fact-form-remove-source"
                          onClick={() => removeSource(index)}
                          aria-label="Remove source"
                          data-testid={`button-remove-source-${index}`}
                        >
                          <Trash2 size={16} />
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
                      <Plus size={14} />
                      Add another source
                    </button>
                  )}
                </div>

                <div className="fact-form-section">
                  <div className="fact-form-field">
                    <label className="fact-form-field-label" htmlFor="considerations">
                      CONSIDERATIONS
                    </label>
                    <p className="fact-form-field-hint">
                      Any nuances, caveats, or counterpoints worth noting. (Optional)
                    </p>
                    <textarea
                      id="considerations"
                      className="fact-form-textarea"
                      value={considerations}
                      onChange={e => setConsiderations(e.target.value)}
                      placeholder="Edge cases or nuances..."
                      rows={3}
                      data-testid="input-considerations"
                    />
                  </div>

                  <div className="fact-form-field">
                    <label className="fact-form-field-label" htmlFor="other-details">
                      OTHER DETAILS
                    </label>
                    <p className="fact-form-field-hint">
                      Anything else you'd like us to know. (Optional)
                    </p>
                    <textarea
                      id="other-details"
                      className="fact-form-textarea"
                      value={otherDetails}
                      onChange={e => setOtherDetails(e.target.value)}
                      placeholder="Any additional context..."
                      rows={3}
                      data-testid="input-other-details"
                    />
                  </div>
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
                    {isSubmitting ? "Submitting…" : "Submit fact"}
                  </button>
                  <p className="fact-form-submit-note">
                    You can submit up to 5 facts every 24 hours.
                  </p>
                </div>

              </form>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
