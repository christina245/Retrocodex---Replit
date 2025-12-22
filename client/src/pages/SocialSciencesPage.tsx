import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Fact } from "@shared/schema";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { TabSelector } from "@/components/TabSelector";
import { CategoryFactCard, type CategoryFact } from "@/components/CategoryFactCard";
import { FactKey } from "@/components/FactKey";
import { BeehiivBanner } from "@/components/BeehiivBanner";
import { SaveModal } from "@/components/SaveModal";
import { ShareModal } from "@/components/ShareModal";
import { Footer } from "@/components/Footer";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Pagination } from "@/components/Pagination";
import { EmptyFilterState } from "@/components/EmptyFilterState";
import coverImage from "@assets/social_sciences_1764794020398.png";
import "./SocialSciencesPage.css";

const FACTS_PER_PAGE = 10;

import photoLearning from "@assets/stock_images/people studying.png";

const socialSciencesFacts: CategoryFact[] = [
  {
    id: "learning-styles",
    myth: "People have different learning styles, such as being a visual or auditory learner.",
    truth: "Learning styles are typically based on self-reported preferences rather than scientific evidence. These preferences do not significantly influence overall learning outcomes or retention.",
    factFilters: [],
    dateAdded: "2025-11-08",
    coverPhoto: photoLearning,
    betaOnly: true
  }
];

const CATEGORY_COLOR = "#E563D1";

export default function SocialSciencesPage() {
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

  const databaseSocialSciencesFacts: CategoryFact[] = useMemo(() => {
    return dbFacts
      .filter(fact => fact.categories.includes("Social Sciences"))
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

  // Sort facts based on active tab
  const sortedFacts = activeTab === "featured" 
    ? allSocialSciencesFacts 
    : [...allSocialSciencesFacts].sort((a, b) => {
        if (!a.dateAdded || !b.dateAdded) return 0;
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });

  // Apply filters
  const filteredFacts = selectedFilters.length > 0
    ? sortedFacts.filter(fact => 
        fact.factFilters && fact.factFilters.some(filter => selectedFilters.some(sf => sf.toLowerCase() === filter.toLowerCase()))
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
    <div className="social-sciences-page">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav activeCategory="SOCIAL SCIENCES" sticky />

      <main className="social-sciences-main-content">
        <div className="social-sciences-intro-row">
          <div className="social-sciences-description">
            <p><b>The way humans work isn't as simple as we were taught growing up.</b></p>
            <p>
              Daily human interaction made it too easy for assumptions about each other to ingrain such powerful mental biases that they shaped entire fields of study.
            </p>
            <p>
              Many of our outdated lessons were simply attempts to make human behavior feel predictable in a world where it rarely is. These explanations were often based on limited data, cultural biases, social prejudice and inequality, or just a narrow range of personal experiences and the intuitive expectations that followed.
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
            <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="social-sciences-filter-container">
              <CategoryFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={handleFilterChange} 
              />
            </div>
            <div className="social-sciences-key-container">
              <FactKey />
            </div>
          </div>

          <div className="social-sciences-content-container">
            <div className="social-sciences-facts-column">
              {filteredFacts.length === 0 && selectedFilters.length > 0 ? (
                <EmptyFilterState />
              ) : (
                <>
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
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </div>

            <aside className="social-sciences-sidebar">
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
