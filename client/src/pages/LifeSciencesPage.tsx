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
import "./LifeSciencesPage.css";

const FACTS_PER_PAGE = 10;


const lifeSciencesFacts: CategoryFact[] = [

  
];

const CATEGORY_COLOR = "#6FCF97";

export default function LifeSciencesPage() {
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

  // Fetch facts from database
  const { data: dbFacts = [] } = useQuery<FactWithCommentCount[]>({
    queryKey: ["/api/facts"],
  });

  // Filter database facts to only include Life Sciences category and convert to CategoryFact format
  const databaseLifeSciencesFacts: CategoryFact[] = useMemo(() => {
    return dbFacts
      .filter(fact => fact.categories.includes("Life Sciences"))
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
  const allLifeSciencesFacts = useMemo(() => {
    const staticIds = new Set(lifeSciencesFacts.map(f => f.id));
    const uniqueDbFacts = databaseLifeSciencesFacts.filter(f => !staticIds.has(f.id));
    return [...lifeSciencesFacts, ...uniqueDbFacts];
  }, [databaseLifeSciencesFacts]);

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
  const sortedFacts = [...allLifeSciencesFacts].sort((a, b) => {
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
    <div className="life-sciences-page">
      <SEO 
        title="Misconceptions About Life Sciences" 
        description="What facts have you been taught in the life sciences that are now outdated? Learn how the discoveries evolved." 
      />
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav activeCategory="LIFE SCIENCES" sticky />

      <main className="life-sciences-main-content">
        <div className="life-sciences-intro-row">
          <div className="life-sciences-description">
            <h1 className="category-page-h1" data-testid="text-category-title">All Misconceptions In Life Sciences</h1>
            <h2 className="category-page-h2" data-testid="text-category-subtitle">What were you taught in school that was oversimplified or is now outdated?</h2>
             <p>As technological advancements uncover new discoveries, plenty of familiar “facts” about animals, humans, microbes, and ecosystems no longer match contemporary evidence.
          
              Many outdated facts in the life sciences are rooted in misinterpreted fossils, oversimplified diagrams, or debunked models of how living beings sense, adapt, and interact with the world.
            </p>
            <p><b>Note:</b> This category focuses on facts you may have been taught in school or on social media. For related old wives' tales typically passed down through family, see <a href="http://theretrocodex.com/category/everyday-life">Everyday Life. </a> </p>
          </div>
        </div>

        <div className="life-sciences-content-area" id="life-sciences-content-area">
          <div className="life-sciences-tabs-row">
            <div className="life-sciences-key-container">
              <FactKey />
            </div>
            <SortSelector selectedSort={sortOption} onSortChange={handleSortChange} />
            <div className="life-sciences-filter-container">
              <CategoryFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={handleFilterChange} 
              />
            </div>
          </div>

          <div className="life-sciences-content-container">
            <div className="life-sciences-facts-column">
              {filteredFacts.length === 0 && selectedFilters.length > 0 ? (
                <EmptyFilterState />
              ) : (
                <>
                  <div className="life-sciences-facts-grid">
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
                    scrollTargetId="life-sciences-content-area"
                  />
                </>
              )}
            </div>

            <aside className="life-sciences-sidebar">
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
            category: "LIFE SCIENCES",
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
