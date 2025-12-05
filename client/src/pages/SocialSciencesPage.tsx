import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Fact } from "@shared/schema";
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
import coverImage from "@assets/social_sciences_1764794020398.png";
import "./SocialSciencesPage.css";

import photoLearning from "@assets/stock_images/people studying.png";

const socialSciencesFacts: CategoryFact[] = [
  {
    id: "learning-styles",
    myth: '"People have different learning styles, such as being a visual or auditory learner."',
    truth: "Learning styles are typically based on self-reported preferences rather than scientific evidence. Research shows they don't significantly influence overall learning outcomes or retention.",
    tags: [],
    dateAdded: "2025-11-08",
    coverPhoto: photoLearning,
    betaOnly: true
  }
];

const CATEGORY_COLOR = "#9B51E0";

export default function SocialSciencesPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"featured" | "recent">("featured");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<CategoryFact | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dbFacts = [] } = useQuery<Fact[]>({
    queryKey: ["/api/facts"],
  });

  const databaseSocialSciencesFacts: CategoryFact[] = useMemo(() => {
    return dbFacts
      .filter(fact => fact.categories.includes("Social Sciences"))
      .map(fact => ({
        id: fact.id,
        myth: fact.mythHeader,
        truth: fact.truthHeader,
        tags: fact.tags || [],
        dateAdded: fact.createdAt ? new Date(fact.createdAt).toISOString().split('T')[0] : undefined,
        link: `/fact/${fact.slug}`,
        coverPhoto: fact.coverPhoto || undefined,
        betaOnly: fact.betaOnly || false,
      }));
  }, [dbFacts]);

  const allSocialSciencesFacts = useMemo(() => {
    const staticIds = new Set(socialSciencesFacts.map(f => f.id));
    const uniqueDbFacts = databaseSocialSciencesFacts.filter(f => !staticIds.has(f.id));
    return [...socialSciencesFacts, ...uniqueDbFacts];
  }, [databaseSocialSciencesFacts]);

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
      title: "Unavailable in beta",
      description: "Only a limited amount of fact entries are available in beta mode. Check back later to view this fact's sources and discussion!",
    });
  };

  const displayedFacts = activeTab === "featured" 
    ? allSocialSciencesFacts 
    : [...allSocialSciencesFacts].sort((a, b) => {
        if (!a.dateAdded || !b.dateAdded) return 0;
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });

  return (
    <div className="social-sciences-page">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <CategoryNav selectedCategory="SOCIAL SCIENCES" />

      <main className="social-sciences-main-content">
        <div className="social-sciences-intro-row">
          <div className="social-sciences-description">
            <p>
              Many social science misconceptions come from psychology—fields where early research, catchy headlines, and simplified classroom diagrams often hardened into "truths." Ideas like the strict left-brain/right-brain divide or the notion that depression is merely a choice gained traction because they were easy to visualize, easy to repeat, and easy for media and pop culture to package. But as research progressed, these explanations proved far more complex and nuanced than the versions that entered everyday conversation.
            </p>
            <p>
              This section uncovers where these myths originated, why they spread so widely, and what modern science actually tells us. Some were born from outdated experiments, others from misunderstandings of scientific terminology, and many from well-intentioned attempts to make human behavior feel predictable.
            </p>
          </div>
          <div className="social-sciences-photo">
            <img 
              src={coverImage} 
              alt="Therapy session with person taking notes" 
              className="social-sciences-photo-img"
            />
          </div>
        </div>

        <div className="social-sciences-content-area">
          <div className="social-sciences-tabs-row">
            <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="social-sciences-filter-container">
              <CategoryFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={setSelectedFilters} 
              />
            </div>
            <div className="social-sciences-key-container">
              <FactKey />
            </div>
          </div>

          <div className="social-sciences-content-container">
            <div className="social-sciences-facts-grid">
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

            <aside className="social-sciences-sidebar">
              <EmailSignupBanner 
                onSubmit={(email) => handleEmailSubmit(email, "social-sciences-page")} 
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
            category: "SOCIAL SCIENCES",
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
