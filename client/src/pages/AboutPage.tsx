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
import scrungyAbout from "@assets/about_page_scrungy_1776195789664.png";
import followButton from "@assets/follow_button_1776196363919.png";
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
        description="Explore Retrocodex, a community-driven encyclopedia dedicated to exploring how misconceptions emerge, evolve, and persist while accounting for diverse perspectives."
      />
      <Header onMenuClick={() => setIsMenuOpen(true)} hideTagline />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav sticky />

      <main className="about-main">
        <div className="about-content-wrapper">
          <div className="about-text-column">
            <h1 className="about-header" data-testid="text-about-header">What is Retrocodex?</h1>

            <div className="about-image-center">
              <img src={scrungyAbout} alt="Scrungy the squirrel introducing Retrocodex" className="about-page-image about-scrungy-image" />
            </div>

            <p className="about-body">
              Retrocodex: Stuff You Learned Wrong, initially inspired by a <a href ="https://www.instagram.com/p/DOqaJ5Gjj4a/?img_index=1" className="about-inline-link">viral social media post</a>, is a community to discover and discuss the misconceptions and outdated information that were once taught as facts in school, media, or in everyday life. It's a place to give your brain a system update.
            </p>
            <p className="about-body">
              ⚠️ Note: This site is NOT a political fact-checker to discuss current political events or news media. However, it does feature broader topics that may be inadvertently politicized by the public, such as false or contested scientific and historical claims used to support current political agendas.
            </p>
            <p className="about-body">
              What everyone was taught varies so much all throughout the world. That's why Retrocodex is a space where you can find other users from the same state or country -- by seeing what topics and comments they submit, you can revisit and patch up the education of your upbringing.</p>
              
            <p className="about-body"> But wait! Everything you learn on this site might still evolve depending on new discoveries. That's what the Follow button on each individual fact page is for -- you'll receive emails every time a fact gets a major update! 
            </p>

            <div className="about-image-center">
              <img src={followButton} alt="Follow button on a fact page" className="about-page-image about-follow-image" />
            </div>

            <p className="about-body">
              The website is currently in a limited beta mode: only the featured facts on the homepage have individual detail pages. Since the research and web development will take a substantial amount of work, the rest of the pages will only be added after reaching a certain amount of traffic and user activity.
            </p>

          

            <p className="about-body">
              <strong>Some new features currently in the works:</strong>
            </p>

            <ul className="about-list">
              <li>
                <strong>Pages by country:</strong> Learn what other people from your state or country were taught growing up! An interactive map that shows topics unique to that region, with a list of the most common topics taught in that region as determined by users.
              </li>
             
             
              
              <li>
                <strong>Global heatmaps:</strong> Visual representations of where specific myths were most commonly taught, powered by user voting and regional submissions.
              </li>
              
            </ul>

            <p className="about-body">
              Understanding our shared history of misinformation is critical to preventing future misinformation, from the benign to the downright harmful. By learning from the past, we can better navigate the present and shape a more informed future.
            </p>

            <p>Retrocodex was created by <a href ="https://theretrocodex.com/user/retro_christina" className="about-inline-link">retro_christina.</a></p>

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
