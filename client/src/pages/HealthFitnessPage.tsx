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
import coverImage from "@assets/health_and_fitness_1764736967989.png";
import "./HealthFitnessPage.css";

const FACTS_PER_PAGE = 10;

import photoFoodPyramid from "@assets/stock_images/food pyramid.png";

const healthFitnessFacts: CategoryFact[] = [

];

const CATEGORY_COLOR = "#F2994A";

export default function HealthFitnessPage() {
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

  const databaseHealthFacts: CategoryFact[] = useMemo(() => {
    return dbFacts
      .filter(fact => fact.categories.includes("Health & Fitness"))
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

  const allHealthFacts = useMemo(() => {
    const staticIds = new Set(healthFitnessFacts.map(f => f.id));
    const uniqueDbFacts = databaseHealthFacts.filter(f => !staticIds.has(f.id));
    return [...healthFitnessFacts, ...uniqueDbFacts];
  }, [databaseHealthFacts]);

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
    ? allHealthFacts 
    : [...allHealthFacts].sort((a, b) => {
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
    <div className="health-fitness-page">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav activeCategory="HEALTH & FITNESS" sticky />

      <main className="health-fitness-main-content">
        <div className="health-fitness-intro-row">
          <div className="health-fitness-description">
            <p><b>You might be more likely to reach your fitness goals when you stop carrying the weight of debunked quick-fix promises.</b></p>
            <p>
              Shortcuts to idealized bodies have always been alluring. Unfortunately, this demand was heavily capitalized on without consulting or understanding the science. Popular media purposely kept readers hooked by publishing clickbait-like content about fat loss, muscle growth, stretching, weightlifting, and more that weren't fully scientifically accurate and thus effective. 
            </p>
            <p>
              These oversimplified rules such as step counts, hydration quotas, universal meal plans spread as they kept promising results. However, the journey towards your fittest, healthiest self is far more complex than any single diet or exercise plan. 
            </p>
          </div>
          <div className="health-fitness-photo">
            <img 
              src={coverImage} 
              alt="Woman lifting weights in a gym" 
              className="health-fitness-photo-img"
            />
          </div>
        </div>

        <div className="health-fitness-content-area" id="health-fitness-content-area">
          <div className="health-fitness-tabs-row">
            <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="health-fitness-filter-container">
              <CategoryFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={handleFilterChange} 
              />
            </div>
            <div className="health-fitness-key-container">
              <FactKey />
            </div>
          </div>

          <div className="health-fitness-content-container">
            <div className="health-fitness-facts-column">
              {filteredFacts.length === 0 && selectedFilters.length > 0 ? (
                <EmptyFilterState />
              ) : (
                <>
                  <div className="health-fitness-facts-grid">
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
                    scrollTargetId="health-fitness-content-area"
                  />
                </>
              )}
            </div>

            <aside className="health-fitness-sidebar">
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
            category: "HEALTH & FITNESS",
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
