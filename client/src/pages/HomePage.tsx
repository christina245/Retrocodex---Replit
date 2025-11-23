import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { CategoryNav } from "@/components/CategoryNav";
import { HeroSection } from "@/components/HeroSection";
import { TabSelector } from "@/components/TabSelector";
import { FactCard, type Fact } from "@/components/FactCard";
import { EmailSignupBanner } from "@/components/EmailSignupBanner";
import { SaveModal } from "@/components/SaveModal";
import { ShareModal } from "@/components/ShareModal";
import { Footer } from "@/components/Footer";
import "./HomePage.css";

const allFacts: Fact[] = [
  {
    id: "1",
    category: "HISTORY",
    categoryColor: "#F5D547",
    myth: "Christopher Columbus discovered the Americas.",
    truth: "Columbus only reached Central and South America. He wasn't even close to what is now the United States. Native peoples had established rich civilizations over thousands of years.",
    dateAdded: "2024-10-15"
  },
  {
    id: "2",
    category: "LIFE SCIENCES",
    categoryColor: "#6FCF97",
    myth: "You only use 10% of your brain.",
    truth: "Your entire brain is used. Brain scans show activity throughout, even when sleeping or at rest. The myth likely came from early misunderstandings of neuroscience, boosted by self-help culture.",
    dateAdded: "2024-10-22"
  },
  {
    id: "3",
    category: "HEALTH & FITNESS",
    categoryColor: "#F2994A",
    myth: "The Food Pyramid is the model for a healthy, balanced diet.",
    truth: "The Food Pyramid's hierarchy reflected the food industry's political and economic ambitions rather than scientific accuracy. In 2011, the USDA replaced it with MyPlate, which suggested more balanced portions.",
    dateAdded: "2024-11-01"
  },
  {
    id: "4",
    category: "EVERYDAY LIFE",
    categoryColor: "#0167A2",
    myth: "Too much sugar makes kids hyper.",
    truth: "There isn't a direct causal link between sugar and hyperactivity. Sugary foods are more likely to be present during exciting activities like birthday parties, creating an illusory correlation.",
    dateAdded: "2024-11-05"
  },
  {
    id: "5",
    category: "SOCIAL SCIENCES",
    categoryColor: "#9B51E0",
    myth: "People have different learning styles, such as being a visual or auditory learner.",
    truth: "Learning styles are typically based on self-reported preferences rather than scientific evidence. Research shows they don't significantly influence overall learning outcomes or retention.",
    dateAdded: "2024-11-08"
  },
  {
    id: "6",
    category: "GENDER & SEXUALITY",
    categoryColor: "#FC5AA8",
    myth: "Men and women have very different brains.",
    truth: "Men's and women's brains are far more similar than different. Traits such as spatial skills, verbal ability, or emotional processing fall on overlapping spectrums.",
    dateAdded: "2024-11-21"
  },
  {
    id: "7",
    category: "OTHER • LINGUISTICS",
    categoryColor: "#2C2C2C",
    myth: "I before E except after C.",
    truth: "English has a lot of words where that 'rule' doesn't hold up. Words like 'science,' 'height,' 'their,' 'protein,' 'caffeine,' 'vein,' 'beige,' 'neighbor,' 'weird,' 'seize,' and many others break this 'rule.'",
    dateAdded: "2024-11-12"
  },
  {
    id: "8",
    category: "LIFE SCIENCES",
    categoryColor: "#6FCF97",
    myth: "Human blood is actually blue until it comes into contact with oxygen.",
    truth: "Deoxygenated blood is still red, just a darker shade. The myth likely have come from seeing veins appear blue through the skin, a visual effect, rather than the blood itself.",
    dateAdded: "2024-11-15"
  },
  {
    id: "9",
    category: "EVERYDAY LIFE",
    categoryColor: "#0167A2",
    myth: "Humans swallow an average of 8 spiders in their sleep every year.",
    truth: "You're unlikely to swallow even one. Your breathing while asleep tends to scare spiders away, not to mention spiders generally avoid humans and our mouths.",
    dateAdded: "2024-11-18"
  },
  {
    id: "10",
    category: "HISTORY",
    categoryColor: "#F5D547",
    myth: "Marie Antoinette ignorantly said 'Let them eat cake' regarding the French Revolution.",
    truth: "This line was actually written by author Jean-Jacques Rousseau and attributed to an unnamed princess years before Marie Antoinette. It may have been misattributed to her as political propaganda.",
    dateAdded: "2024-11-20"
  }
];

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"featured" | "recent">("featured");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<Fact | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const emailMutation = useMutation({
    mutationFn: async ({ email, source }: { email: string; source: string }) => {
      return await apiRequest("POST", "/api/emails", { email, source });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "We'll notify you when accounts are available.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEmailSubmit = async (email: string, source: string) => {
    await emailMutation.mutateAsync({ email, source });
  };

  const handleSaveClick = () => {
    setIsSaveModalOpen(true);
  };

  const handleShareClick = (fact: Fact) => {
    setShareModalFact(fact);
  };

  const handleCommentClick = () => {
    toast({
      title: "Coming Soon",
      description: "Individual fact pages with comments are in development.",
    });
  };

  const displayedFacts = activeTab === "featured" 
    ? allFacts 
    : [...allFacts].sort((a, b) => {
        if (!a.dateAdded || !b.dateAdded) return 0;
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });

  return (
    <div className="page-wrapper">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <CategoryNav />

      <main className="main-content">
        <HeroSection />
        
        <div className="content-container">
          <div className="main-column">
            <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="facts-grid">
              {displayedFacts.map((fact) => (
                <FactCard
                  key={fact.id}
                  fact={fact}
                  onSave={handleSaveClick}
                  onShare={() => handleShareClick(fact)}
                  onComment={handleCommentClick}
                />
              ))}
            </div>
          </div>

          <aside className="sidebar">
            <EmailSignupBanner 
              onSubmit={(email) => handleEmailSubmit(email, "signup-banner")} 
            />
          </aside>
        </div>
      </main>

      <Footer />

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSubmit={(email) => handleEmailSubmit(email, "save-modal")}
      />
      <ShareModal
        isOpen={shareModalFact !== null}
        onClose={() => setShareModalFact(null)}
        fact={shareModalFact}
      />
    </div>
  );
}
