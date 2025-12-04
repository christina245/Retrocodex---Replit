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
import coverImage from "@assets/gender_and_sexuality_(1)_1764810626965.png";
import "./GenderSexualityPage.css";

import photoGenderBrains from "@assets/stock_images/men vs women.png";

const genderSexualityFacts: CategoryFact[] = [
  {
    id: "gender-brains",
    myth: '"Men and women have very different brains."',
    truth: "Men's and women's brains are far more similar than different. Traits such as spatial skills, verbal ability, or emotional processing fall on overlapping spectrums.",
    tags: [],
    dateAdded: "2025-11-21",
    coverPhoto: photoGenderBrains,
    betaOnly: true
  }
];

const CATEGORY_COLOR = "#FC5AA8";

export default function GenderSexualityPage() {
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

  const databaseGenderFacts: CategoryFact[] = useMemo(() => {
    return dbFacts
      .filter(fact => fact.categories.includes("Gender & Sexuality"))
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

  const allGenderFacts = useMemo(() => {
    const staticIds = new Set(genderSexualityFacts.map(f => f.id));
    const uniqueDbFacts = databaseGenderFacts.filter(f => !staticIds.has(f.id));
    return [...genderSexualityFacts, ...uniqueDbFacts];
  }, [databaseGenderFacts]);

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
    ? allGenderFacts 
    : [...allGenderFacts].sort((a, b) => {
        if (!a.dateAdded || !b.dateAdded) return 0;
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });

  return (
    <div className="gender-sexuality-page">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <CategoryNav selectedCategory="GENDER & SEXUALITY" />

      <main className="gender-sexuality-main-content">
        <div className="gender-sexuality-intro-row">
          <div className="gender-sexuality-description">
            <p>
              Many myths—like the idea that "men and women have very different brains"—took hold long before modern neuroscience existed. Early researchers often interpreted small, inconsistent findings through the lens of their own cultural expectations, reinforcing stereotypes rather than challenging them. These misconceptions were amplified by centuries of sexism, attempts to justify rigid gender roles, and pop-science articles that overstated weak or misrepresented data. Today, we know that brain differences within each gender are far larger than differences between genders, and that human behavior is shaped by biology, culture, and lived experience—not simplistic binaries.
            </p>
            <p>
              Other widespread myths, such as the claim that "being LGBT is a Western concept," grew out of colonialism, incomplete histories, and efforts to control people's identities. Many societies around the world long recognized same-sex relationships, third genders, and gender-diverse roles, but these traditions were suppressed or erased by outside forces. Limited research, political agendas, and cultural gatekeeping allowed these myths to spread and persist.
            </p>
          </div>
          <div className="gender-sexuality-photo">
            <img 
              src={coverImage} 
              alt="Pink and blue balloons" 
              className="gender-sexuality-photo-img"
            />
          </div>
        </div>

        <div className="gender-sexuality-content-area">
          <div className="gender-sexuality-tabs-row">
            <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="gender-sexuality-filter-container">
              <CategoryFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={setSelectedFilters} 
              />
            </div>
            <div className="gender-sexuality-key-container">
              <FactKey />
            </div>
          </div>

          <div className="gender-sexuality-content-container">
            <div className="gender-sexuality-facts-grid">
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

            <aside className="gender-sexuality-sidebar">
              <EmailSignupBanner 
                onSubmit={(email) => handleEmailSubmit(email, "gender-sexuality-page")} 
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
            category: "GENDER & SEXUALITY",
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
