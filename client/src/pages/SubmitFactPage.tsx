import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { BeehiivBanner } from "@/components/BeehiivBanner";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { SignInModal } from "@/components/SignInModal";
import { useAuth } from "@/lib/auth";
import "./SubmitFactPage.css";

export default function SubmitFactPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const { isLoggedIn } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmitClick = () => {
    if (isLoggedIn) {
      navigate("/submit/form");
    } else {
      setShowSignIn(true);
    }
  };

  return (
    <div className="submit-fact-page">
      <SEO 
        title="Fact Submission Rules | Retrocodex"
        description="Review the submission guidelines before submitting a fact to Retrocodex. Learn what types of claims are accepted and how to format your submission."
      />
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav sticky />

      <main className="submit-fact-main">
        <div className="submit-fact-content-wrapper">
          <div className="submit-fact-text-column">
            <h1 className="submit-fact-header" data-testid="text-submit-fact-header">Fact submission rules</h1>
            
            <p className="submit-fact-body">
              This site documents widely believed myths and misconceptions that have circulated broadly, and are often repeated by educators, the media, or the public despite strong factual opposing evidence.
            </p>

            <p className="submit-fact-body">
              Before submitting, please review the rules. Submissions that do not meet the following criteria will not be accepted:
            </p>

            <div className="submit-fact-rule">
              <span className="submit-fact-rule-number">1.</span>
              <div className="submit-fact-rule-content">
                <p className="submit-fact-rule-title">Your submission must be a widely believed claim.</p>
                <p className="submit-fact-body">
                  The claim must be commonly repeated in formal education, media, culture, or everyday conversation at some point during the last 100 years. This can include claims specific to certain parts of the world. These topics will be labeled as "Regionally Taught".
                </p>
                <p className="submit-fact-body">
                  Topics should not be obscure, hyper-specific, or limited to a small online community. In the future, Retrocodex may feature blog posts dedicated to niche communities.
                </p>
              </div>
            </div>

            <div className="submit-fact-rule">
              <span className="submit-fact-rule-number">2.</span>
              <div className="submit-fact-rule-content">
                <p className="submit-fact-rule-title">No contemporary political misinformation.</p>
                <p className="submit-fact-body">
                  This is NOT a political fact-checking site. Please visit <a href="https://www.politifact.com/" target="_blank" rel="noopener noreferrer" className="submit-fact-link">Politifact</a> for contemporary political misinformation.
                </p>
                <p className="submit-fact-body">
                  We do not accept submissions that:
                </p>
                <ul className="submit-fact-list">
                  <li>Focus on current political figures, parties, elections, campaigns, or active policy debates</li>
                  <li>Make claims framed around what a specific modern politician did, said, or believes</li>
                  <li>Example: "The last election was stolen."</li>
                </ul>
                <p className="submit-fact-body">
                  Topics disproven by scientific and historical data that happen to be used in contemporary political agendas are sometimes allowed, such as:
                </p>
                <ul className="submit-fact-list">
                  <li>"Being transgender is a new phenomenon."</li>
                  <li>"Being gay is a Western concept."</li>
                </ul>
                <p className="submit-fact-body">
                  These topics can be found on the <Link href="/category/gender-sexuality" className="submit-fact-link">Gender & Sexuality</Link> page.
                </p>
              </div>
            </div>

            <div className="submit-fact-rule">
              <span className="submit-fact-rule-number">3.</span>
              <div className="submit-fact-rule-content">
                <p className="submit-fact-rule-title">The claim must be disproven by hard evidence or a lack of evidence.</p>
                <p className="submit-fact-body">
                  Your submission must describe a claim that can be evaluated using:
                </p>
                <ul className="submit-fact-list">
                  <li>Empirical evidence</li>
                  <li>Historical records</li>
                  <li>Scientific or scholarly research</li>
                </ul>
                <p className="submit-fact-body">
                  Topics with divided expert opinions on their validity are accepted, such as:
                </p>
                <ul className="submit-fact-list">
                  <li>"Viruses, unlike bacteria, aren't alive."</li>
                  <li>"We will achieve AGI (artificial general intelligence) within the next few years."</li>
                </ul>
                <p className="submit-fact-body">
                  These topics can be found on the <Link href="/?tab=debated" className="submit-fact-link">Debated section</Link> on the homepage.
                </p>
                <p className="submit-fact-body submit-fact-note">
                  Note: Topics with an "Uncertain" label feature divided expert opinions on the claim's validity, with some believing it is true. Debated topics without the "Uncertain" label feature claims that have been generally disproven, but with divided beliefs on the current truth.
                </p>
              </div>
            </div>

            <div className="submit-fact-agreement">
              <label className="submit-fact-checkbox-label" data-testid="label-agreement">
                <input 
                  type="checkbox"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="submit-fact-checkbox"
                  data-testid="checkbox-agreement"
                />
                <span className={`submit-fact-checkbox-custom ${hasAgreed ? 'checked' : ''}`}></span>
                <span className="submit-fact-checkbox-text">
                  I have read the rules, believe my submission is aligned, and understand that Retrocodex may edit my submission to best align with the website format.
                </span>
              </label>
            </div>

            <div className="submit-fact-button-wrapper">
              {hasAgreed ? (
                <button
                  className="submit-fact-button active"
                  onClick={handleSubmitClick}
                  data-testid="button-submit-fact-active"
                >
                  Submit a Fact
                </button>
              ) : (
                <span 
                  className="submit-fact-button disabled"
                  data-testid="button-submit-fact-disabled"
                >
                  Submit a Fact
                </span>
              )}
            </div>
          </div>

          <aside className="submit-fact-sidebar">
            <BeehiivBanner />
          </aside>
        </div>
      </main>

      <Footer />

      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        customTitle="Create an account or log in to submit a fact."
        onSuccessRedirect="/submit/form"
      />
    </div>
  );
}
