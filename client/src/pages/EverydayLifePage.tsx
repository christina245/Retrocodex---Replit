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
import "./EverydayLifePage.css";

const FACTS_PER_PAGE = 10;


import photoSpiders from "@assets/stock_images/plastic spiders.png";
import photoHyperKids from "@assets/stock_images/hyper kids.png";


const everydayLifeFacts: CategoryFact[] = [
  

 
 
];

const CATEGORY_COLOR = "#2A9BEC";

export default function EverydayLifePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<CategoryFact | null>(null);
  const [sourcesModalFactId, setSourcesModalFactId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const { savedFactIds, toggleSave } = useSavedFacts(isLoggedIn);
  const queryClient = useQueryClient();

  // Fetch facts from database
  const { data: dbFacts = [] } = useQuery<FactWithCommentCount[]>({
    queryKey: ["/api/facts"],
  });

  // Filter database facts to only include Everyday Life category and convert to CategoryFact format
  const databaseEverydayLifeFacts: CategoryFact[] = useMemo(() => {
    return dbFacts
      .filter(fact => fact.categories.includes("Everyday Life"))
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

  // Merge static facts with database facts (database facts appear after static ones)
  const allEverydayLifeFacts = useMemo(() => {
    const staticIds = new Set(everydayLifeFacts.map(f => f.id));
    const uniqueDbFacts = databaseEverydayLifeFacts.filter(f => !staticIds.has(f.id));
    return [...everydayLifeFacts, ...uniqueDbFacts];
  }, [databaseEverydayLifeFacts]);

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
      title: "Unavailable in beta",
      description: "At this time, only the Featured facts on the homepage have published entries. Subscribe to be notified when all entries are available!",
    });
  };

  const handleBetaClick = (factId: string) => {
    setSourcesModalFactId(factId);
  };

  // Sort facts by most recently added (only enabled sort option for now)
  const sortedFacts = [...allEverydayLifeFacts].sort((a, b) => {
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
    <div className="everyday-life-page">
      <SEO 
        title="Misconceptions About Everyday Life" 
        description="Challenge everyday assumptions and common knowledge from all over the world. Find out what's true and what's myth in everyday sayings you might hear from friends and family." 
      />
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav activeCategory="EVERYDAY LIFE" sticky />

      <main className="everyday-life-main-content">
        <div className="everyday-life-intro-row">
          <div className="everyday-life-description">
            <h1 className="category-page-h1" data-testid="text-category-title">All Misconceptions In Everyday Life</h1>
            <h2 className="category-page-h2" data-testid="text-category-subtitle">What's the evidence debunking (or validating) the everyday folklore, superstitions, and urban legends we learned from our elders?</h2>
            <p>
              These informal, familiar, intuitive, traditional lessons often originated as attempts to explain everyday experiences, teach caution, or impose order on the unpredictable, long before scientific research was accessible to the public.
              This collection explores both untrue information in today's popular culture and the classic old wives' tales we were taught at home growing up.</p> 
            
          </div>
        </div>

        <div className="everyday-life-content-area" id="everyday-life-content-area">
          <div className="everyday-life-tabs-row">
            <div className="everyday-life-key-container">
              <FactKey />
            </div>
            <SortSelector selectedSort={sortOption} onSortChange={handleSortChange} />
            <div className="everyday-life-filter-container">
              <CategoryFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={handleFilterChange} 
              />
            </div>
          </div>

          <div className="everyday-life-content-container">
            <div className="everyday-life-facts-column">
              {filteredFacts.length === 0 && selectedFilters.length > 0 ? (
                <EmptyFilterState />
              ) : (
                <>
                  <div className="everyday-life-facts-grid">
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
                    scrollTargetId="everyday-life-content-area"
                  />
                </>
              )}
            </div>

            <aside className="everyday-life-sidebar">
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
            category: "EVERYDAY LIFE",
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
