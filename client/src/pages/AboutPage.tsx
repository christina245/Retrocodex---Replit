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
              Retrocodex: Stuff You Might Have Learned Wrong is a living archive dedicated to collectively exploring how each misconception emerged, evolved, and persisted while accounting for diverse and contradictory perspectives.
            </p>

            <p className="about-body">
              In a living archive, new misconceptions are continuously added. Each entry is updated when new relevant discoveries arise. When user accounts become available, you'll be able to learn how other users were affected by each misconception, contribute your own experiences, and receive email updates when new information is discovered that further verifies or refutes the myth. 
            </p>

            <p className="about-body">
              At Retrocodex, facts are treated as something to be continually examined, not permanently settled. Even with the misconceptions debunked by the strongest evidence, new information can always emerge.
            </p>

            <p className="about-body">
              The website is currently in a limited beta mode: only the featured facts on the homepage have individual detail pages. Since the research is extremely labor-intensive, the rest of the pages will be added after a certain amount of people are on the waitlist to assure adequate demand.
            </p>

            <p className="about-body">
              These features, along with the research and engineering behind them, require strong investment in software development, cybersecurity, fact-checking, copywriting, and human expertise.
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
              Understanding our shared history of misinformation is critical to preventing future misinformation, from the benign to the downright harmful. By learning from the past, we can better navigate the present and shape a more informed future.
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
