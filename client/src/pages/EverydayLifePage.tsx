import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { CategoryNav } from "@/components/CategoryNav";
import { TabSelector } from "@/components/TabSelector";
import { CategoryFactCard, type CategoryFact } from "@/components/CategoryFactCard";
import { FactKey } from "@/components/FactKey";
import { EmailSignupBanner } from "@/components/EmailSignupBanner";
import { SaveModal } from "@/components/SaveModal";
import { ShareModal } from "@/components/ShareModal";
import { Footer } from "@/components/Footer";
import { CategoryFilter } from "@/components/CategoryFilter";
import coverImage from "@assets/everyday life_1764573292477.png";
import "./EverydayLifePage.css";

import photoGum from "@assets/chewing gum_1764576659258.png";
import photoSpiders from "@assets/stock_images/plastic spiders.png";
import photoHyperKids from "@assets/stock_images/hyper kids.png";
import photoColds from "@assets/catching a cold_1764363998621.png";

const everydayLifeFacts: CategoryFact[] = [
  {
    id: "gum-seven-years",
    myth: '"If you swallow gum, it\'ll stay in your stomach for seven years."',
    truth: "Gum won't stay inside your body if swallowed. However, it can't be digested like other foods, so it passes through waste intact rather than broken down.",
    tags: [],
    dateAdded: "2025-11-25",
    link: "/fact/gum-seven-years",
    coverPhoto: photoGum
  },
  {
    id: "swallow-spiders",
    myth: '"Humans swallow an average of 8 spiders in their sleep every year."',
    truth: "You're unlikely to swallow even one. Your breathing while asleep tends to scare spiders away, not to mention spiders generally avoid humans and our mouths.",
    tags: [],
    dateAdded: "2025-11-18",
    link: "/fact/swallow-spiders",
    coverPhoto: photoSpiders
  },
  {
    id: "sugar-hyper",
    myth: '"Too much sugar makes kids hyper."',
    truth: "There isn't a direct causal link between sugar and hyperactivity. Sugary foods are more likely to be present during exciting activities like birthday parties, creating an illusory correlation.",
    tags: [],
    dateAdded: "2025-11-05",
    link: "/fact/sugar-hyper",
    coverPhoto: photoHyperKids
  },
  {
    id: "colds-from-cold",
    myth: '"You catch colds from being cold."',
    truth: "Colds are caused by viruses, not temperature. During cold weather, you're more likely to be indoors where viruses spread more easily.",
    tags: [],
    dateAdded: "2025-11-24",
    link: "/fact/colds-from-cold",
    coverPhoto: photoColds
  }
];

const CATEGORY_COLOR = "#0167A2";

export default function EverydayLifePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"featured" | "recent">("featured");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<CategoryFact | null>(null);
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

  const handleShareClick = (fact: CategoryFact) => {
    setShareModalFact(fact);
  };

  const handleCommentClick = () => {
    toast({
      title: "Coming Soon",
      description: "Individual fact pages with comments are in development.",
    });
  };

  const handleBetaClick = () => {
    toast({
      title: "Under Development",
      description: "Individual fact pages are still under development. Check back soon!",
    });
  };

  const displayedFacts = activeTab === "featured" 
    ? everydayLifeFacts 
    : [...everydayLifeFacts].sort((a, b) => {
        if (!a.dateAdded || !b.dateAdded) return 0;
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });

  return (
    <div className="everyday-life-page">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <CategoryNav selectedCategory="EVERYDAY LIFE" />

      <main className="everyday-life-main-content">
        <div className="everyday-life-intro-row">
          <div className="everyday-life-description">
            <p>
              Everyday life is full of little "facts" we absorb without ever checking where they came from. Family sayings, schoolyard rumors, well-meaning advice from adults, and catchy lines from old advertisements often blend together into a kind of informal rulebook for living. Claims such as "breakfast is the most important meal of the day" may not be true, but they persist because they're memorable, comforting, or framed as simple rules for staying healthy, polite, or responsible.
            </p>
            <p>
              Many of these myths didn't originate as deliberate falsehoods, but as misunderstandings, exaggerations, or outdated beliefs passed through generations. Everyday myths reveal how information spreads in the absence of formal teaching: not through textbooks or experts, but through habits, culture, and repetition. This collection explores the roots, evidence, and cultural history behind these familiar claims.
            </p>
          </div>
          <div className="everyday-life-photo">
            <img 
              src={coverImage} 
              alt="Everyday Life - Couple at holiday market" 
              className="everyday-life-photo-img"
            />
          </div>
        </div>

        <div className="everyday-life-content-area">
          <div className="everyday-life-tabs-row">
            <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="everyday-life-filter-container">
              <CategoryFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={setSelectedFilters} 
              />
            </div>
            <div className="everyday-life-key-container">
              <FactKey />
            </div>
          </div>

          <div className="everyday-life-content-container">
            <div className="everyday-life-facts-grid">
              {displayedFacts.map((fact) => (
                <CategoryFactCard
                  key={fact.id}
                  fact={fact}
                  categoryColor={CATEGORY_COLOR}
                  onSave={handleSaveClick}
                  onShare={() => handleShareClick(fact)}
                  onComment={handleCommentClick}
                  onBetaClick={handleBetaClick}
                />
              ))}
            </div>

            <aside className="everyday-life-sidebar">
              <EmailSignupBanner 
                onSubmit={(email) => handleEmailSubmit(email, "everyday-life-page")} 
              />
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSubmit={(email) => handleEmailSubmit(email, "save-modal")}
      />
      {shareModalFact && (
        <ShareModal
          isOpen={!!shareModalFact}
          onClose={() => setShareModalFact(null)}
          fact={{
            id: shareModalFact.id,
            category: "EVERYDAY LIFE",
            categoryColor: CATEGORY_COLOR,
            myth: shareModalFact.myth,
            truth: shareModalFact.truth,
            link: shareModalFact.link
          }}
        />
      )}
    </div>
  );
}
