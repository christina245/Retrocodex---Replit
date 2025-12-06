import { useState } from "react";
import { HandHeart } from "lucide-react";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { CategoryNav } from "@/components/CategoryNav";
import { BeehiivBanner } from "@/components/BeehiivBanner";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import "./AboutPage.css";

export default function AboutPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = async (email: string) => {
    try {
      await apiRequest("POST", "/api/emails", { 
        email,
        source: "signup-banner"
      });
      toast({
        title: "Thanks for signing up!",
        description: "We'll notify you when user accounts are available."
      });
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="about-page">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <CategoryNav />

      <main className="about-main">
        <div className="about-content-wrapper">
          <div className="about-text-column">
            <h1 className="about-header" data-testid="text-about-header">About</h1>
            
            <h2 className="about-subheader" data-testid="text-about-subheader">
              "What have you been taught that <span className="about-subheader-italic">isn't true?</span>"
            </h2>

            <p className="about-body">
              Retrocodex is a living archive dedicated not just to correcting outdated facts, but to understanding how disinformation spreads in the first place.
            </p>

            <p className="about-body">
              Each disproven fact features a timeline showing how the misconception emerged, evolved, and was eventually debunked. You can explore the discoveries that shifted understanding, the controversies that shaped public perception, and the nuances that explain why the myth persisted.
            </p>

            <p className="about-body">
              Beyond mapping the spread of disinformation, Retrocodex aims to make everybody's experiences with learning heard. When user accounts are ready, we'd love to hear from everybody where, when, and how you learned each misconception — whether in school, from family, through media, or simply by cultural osmosis.
            </p>

            <p className="about-body">
              As you can see, the website is currently in beta mode without registered users! Once there's enough traffic, we aim to build an interactive platform where registered users can vote, comment, discuss, and contribute to the collective record.
            </p>

            <p className="about-body">
              These features, along with the research and engineering behind them, require meaningful investment in software development, cybersecurity, fact-checking, photo licensing, and human expertise.
            </p>

            <p className="about-body">
              <strong>Some new features currently in the works:</strong>
            </p>

            <ul className="about-list">
              <li>
                <strong>"Regionally Taught" pages:</strong> Dedicated sections that highlight how certain misconceptions were taught differently across countries, states, or school districts — revealing how misinformation spreads geographically.
              </li>
              <li>
                <strong>User messaging & community tools:</strong> A private messaging and public profile creation system that lets users connect, compare experiences, show off where you grew up and your professional credentials, and even organize local advocacy or education campaigns together.
              </li>
              <li>
                <strong>Global heatmaps:</strong> Visual representations of where specific myths were most commonly taught, powered by user voting and regional submissions.
              </li>
              <li>
                <strong>A personalized misinformation report:</strong> A chatbot generating a personalized report of what you may have been taught incorrectly based on your graduation year and location, refined by user feedback. (Note: AI will only be used for curating the website's own human-researched facts, not generating facts itself.)
              </li>
            </ul>

            <p className="about-body">
              Retrocodex is more than a static archive. It's a collective, dynamic effort to understand our shared history of misinformation so we can build a more informed future and not repeat past mistakes.
            </p>

            <h2 className="about-cta-text" data-testid="text-about-cta">
              What's a misconception that bothers you? Send it over to be featured!
            </h2>

            <div className="about-buttons">
              <a 
                href="https://form.typeform.com/to/pal6ZbpG" 
                target="_blank" 
                rel="noopener noreferrer"
                className="about-submit-button"
                data-testid="button-about-submit-fact"
              >
                Submit a Fact
              </a>
              <a 
                href="https://buymeacoffee.com/retrocodex" 
                target="_blank" 
                rel="noopener noreferrer"
                className="about-donate-button"
                data-testid="button-about-donate"
              >
                <HandHeart size={16} className="about-donate-icon" />
                Donate
              </a>
            </div>
          </div>

          <aside className="about-sidebar">
            <BeehiivBanner />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
