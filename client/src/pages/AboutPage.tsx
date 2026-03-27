import { useState } from "react";
import { HandHeart } from "lucide-react";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { SendgridBanner } from "@/components/SendgridBanner";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
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
      <SEO 
        title="About Retrocodex: What You Might Have Learned Wrong"
        description="Learn about Retrocodex, a community-driven encyclopedia dedicated to exploring how misconceptions emerge, evolve, and persist while accounting for diverse perspectives."
      />
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav sticky />

      <main className="about-main">
        <div className="about-content-wrapper">
          <div className="about-text-column">
            <h1 className="about-header" data-testid="text-about-header">About</h1>
            
            <h2 className="about-subheader" data-testid="text-about-subheader">
              "What have you been taught that <span className="about-subheader-italic">isn't true?</span>"
            </h2>

            <p className="about-body">
              Retrocodex: Stuff You Learned Wrong is a community-driven encyclopedia exploring how common misconceptions and outdated facts emerged, evolved, and persisted while accounting for diverse and contradictory perspectives.
            </p>

            <p className="about-body">
              In a community-driven platform, you and everyone else are welcome to submit new topics you believe are worth questioning and suggestions to existing topics you believe validate or even invalidate the facts. Each entry is updated when new relevant discoveries arise. When user accounts become available, you'll be able to learn how other users were affected by each misconception, contribute your own experiences, and receive email updates when new information is discovered that further verifies or refutes the myth. 
            </p>
            

            <p className="about-body">
              At Retrocodex, facts are treated as something to be continually examined, not permanently settled. Even with the misconceptions debunked by the strongest evidence, new information can always emerge. Many of the topics on this site were once considered verified facts until they were disproven by time and new research. Some may still be taught as facts in certain places. 
            </p>

            <p className="about-body">
              The website is currently in a limited beta mode: only the featured facts on the homepage have individual detail pages. Since the research and web development will require much more investment of resources than this beta, the rest of the pages and user accounts will only be added after reaching a certain amount of traffic and email signups.
            </p>

          

            <p className="about-body">
              <strong>Some new features currently in the works:</strong>
            </p>

            <ul className="about-list">
              <li>
                <strong>Pages by country:</strong> An interactive map that shows topics unique to that region, with a list of the most common topics taught in that region as determined by users.
              </li>
              <li>
                <strong>A personalized dashboard:</strong> See what other topics users in your county (and any other selected locations) report through their submissions and comments.
              </li>
              <li>
                <strong>User messaging & community tools:</strong> A private messaging and public profile creation system that'll let you connect, compare experiences, show off where you grew up and your professional credentials, and even organize local advocacy or education campaigns together.
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
                href="https://theretrocodex.com/submit" 
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
            <SendgridBanner />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
