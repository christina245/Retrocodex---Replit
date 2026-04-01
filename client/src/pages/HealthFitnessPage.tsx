import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Fact, FactWithCommentCount } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { SortSelector, type SortOption } from "@/components/SortSelector";
import { CategoryFactCard, type CategoryFact } from "@/components/CategoryFactCard";
import { FactKey } from "@/components/FactKey";
import { SendgridBanner } from "@/components/SendgridBanner";
import { SaveModal } from "@/components/SaveModal";
import { useAuth } from "@/lib/auth";
import { useSavedFacts } from "@/lib/useSavedFacts";
import { ShareModal } from "@/components/ShareModal";
import { SourcesModal } from "@/components/SourcesModal";
import { Footer } from "@/components/Footer";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Pagination } from "@/components/Pagination";
import { EmptyFilterState } from "@/components/EmptyFilterState";
import "./HealthFitnessPage.css";

const FACTS_PER_PAGE = 10;



const healthFitnessFacts: CategoryFact[] = [

];

const CATEGORY_COLOR = "#F2994A";

export default function HealthFitnessPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<CategoryFact | null>(null);
  const [sourcesModalFactId, setSourcesModalFactId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();
  const { savedFactIds, toggleSave } = useSavedFacts(isLoggedIn);

  const { data: dbFacts = [] } = useQuery<FactWithCommentCount[]>({
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
        revisionYear: fact.revisionYear ?? undefined,
        taughtUntilYear: fact.taughtUntilYear ?? undefined,
        commentCount: fact.commentCount ?? 0,
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

  const handleSaveClick = (factId: string) => {
    if (!isLoggedIn) {
      setIsSaveModalOpen(true);
      return;
    }
    toggleSave(factId);
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

  const handleBetaClick = (factId: string) => {
    setSourcesModalFactId(factId);
  };

  // Sort facts by most recently added (only enabled sort option for now)
  const sortedFacts = [...allHealthFacts].sort((a, b) => {
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

  const handleSortChange = (sort: SortOption) => {
    setSortOption(sort);
    setCurrentPage(1);
  };

  return (
    <div className="health-fitness-page">
      <SEO 
        title="Misconceptions About Health & Fitness" 
        description="Get the facts about health, nutrition, and fitness. Discover what science says about popular health beliefs and workout myths." 
      />
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav activeCategory="HEALTH & FITNESS" sticky />

      <main className="health-fitness-main-content">
        <div className="health-fitness-intro-row">
          <div className="health-fitness-description">
            <h1 className="category-page-h1" data-testid="text-category-title">All Misconceptions In Health & Fitness</h1>
            <h2 className="category-page-h2" data-testid="text-category-subtitle">You might be more likely to reach your fitness goals when you stop carrying the weight of debunked quick-fix promises.</h2>
            <p>
              Shortcuts to idealized bodies have always been alluring. Unfortunately, this demand was heavily capitalized on without consulting or understanding the science, leading to a variety of fitness myths spread through popular media and clickbait content. But as they kept promising results, the public held on to these common myths about weight loss, muscle building, dieting, and more.
            </p>
      
          </div>
        </div>

        <div className="health-fitness-content-area" id="health-fitness-content-area">
          <div className="health-fitness-tabs-row">
            <div className="health-fitness-key-container">
              <FactKey />
            </div>
            <SortSelector selectedSort={sortOption} onSortChange={handleSortChange} />
            <div className="health-fitness-filter-container">
              <CategoryFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={handleFilterChange} 
              />
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
                        onSave={() => handleSaveClick(fact.id)}
                        onShare={() => handleShareClick(fact)}
                        onComment={handleCommentClick}
                        onBetaClick={handleBetaClick}
                        isSaved={savedFactIds.has(fact.id)}
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
              <SendgridBanner />
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
      <SourcesModal
        factId={sourcesModalFactId}
        onClose={() => setSourcesModalFactId(null)}
      />
    </div>
  );
}
