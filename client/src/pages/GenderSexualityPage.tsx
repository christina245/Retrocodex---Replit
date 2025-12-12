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
import { BeehiivBanner } from "@/components/BeehiivBanner";
import { SaveModal } from "@/components/SaveModal";
import { ShareModal } from "@/components/ShareModal";
import { Footer } from "@/components/Footer";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Pagination } from "@/components/Pagination";
import coverImage from "@assets/gender_and_sexuality_(1)_1764810626965.png";
import "./GenderSexualityPage.css";

const FACTS_PER_PAGE = 10;

import photoGenderBrains from "@assets/stock_images/men vs women.png";

const genderSexualityFacts: CategoryFact[] = [
  {
    id: "gender-brains",
    myth: "Men and women have very different brains.",
    truth: "Men's and women's brains are far more similar than different. Traits such as spatial skills, verbal ability, or emotional processing fall on overlapping spectrums.",
    factFilters: [],
    dateAdded: "2025-11-21",
    coverPhoto: photoGenderBrains,
    betaOnly: true
  }
];

const CATEGORY_COLOR = "#FF88AA";

export default function GenderSexualityPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"featured" | "recent">("featured");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<CategoryFact | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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
        factFilters: fact.factFilters || [],
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
      title: "Unavailable in beta",
      description: "Only a limited amount of fact entries are available in beta mode. Check back later to view this fact's sources and discussion!",
    });
  };

  // Sort facts based on active tab
  const sortedFacts = activeTab === "featured" 
    ? allGenderFacts 
    : [...allGenderFacts].sort((a, b) => {
        if (!a.dateAdded || !b.dateAdded) return 0;
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });

  // Apply filters
  const filteredFacts = selectedFilters.length > 0
    ? sortedFacts.filter(fact => 
        fact.factFilters && fact.factFilters.some(filter => selectedFilters.includes(filter))
      )
    : sortedFacts;

  // Calculate pagination
  const totalPages = Math.ceil(filteredFacts.length / FACTS_PER_PAGE);
  const startIndex = (currentPage - 1) * FACTS_PER_PAGE;
  const displayedFacts = filteredFacts.slice(startIndex, startIndex + FACTS_PER_PAGE);

  // Reset to page 1 when filters or tab changes
  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: "featured" | "recent") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="gender-sexuality-page">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <CategoryNav selectedCategory="GENDER & SEXUALITY" />

      <main className="gender-sexuality-main-content">
        <div className="gender-sexuality-intro-row">
          <div className="gender-sexuality-description">
            <p>
              <b>Gender and sexuality have never been as binary as what many of us would like to believe.</b></p>
              <p> Throughout history, views on gender and sexuality were often formed through prejudice, rigid social norms, superficial assumptions, or the attempt to reinforce power structures rather than factual data. The exclusion of women and sexual minorities from scientific and cultural authority further slowed progress towards understanding these complex topics.
            </p>
            <p>
              Research now shows that human behavior and identity arise from a complex interplay of biology, environment, culture, and individual lived realities rather than narrow binary models. 
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
            <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="gender-sexuality-filter-container">
              <CategoryFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={handleFilterChange} 
              />
            </div>
            <div className="gender-sexuality-key-container">
              <FactKey />
            </div>
          </div>

          <div className="gender-sexuality-content-container">
            <div className="gender-sexuality-facts-column">
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
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>

            <aside className="gender-sexuality-sidebar">
              <BeehiivBanner />
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
