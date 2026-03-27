import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Fact } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { SortSelector, type SortOption } from "@/components/SortSelector";
import { CategoryFactCard, type CategoryFact } from "@/components/CategoryFactCard";
import { FactKey } from "@/components/FactKey";
import { BeehiivBanner } from "@/components/BeehiivBanner";
import { SaveModal } from "@/components/SaveModal";
import { useAuth } from "@/lib/auth";
import { useSavedFacts } from "@/lib/useSavedFacts";
import { ShareModal } from "@/components/ShareModal";
import { SourcesModal } from "@/components/SourcesModal";
import { Footer } from "@/components/Footer";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Pagination } from "@/components/Pagination";
import { EmptyFilterState } from "@/components/EmptyFilterState";
import "./HistoryPage.css";

const FACTS_PER_PAGE = 10;


const historyFacts: CategoryFact[] = [

 
];

const CATEGORY_COLOR = "#DFB600";

export default function HistoryPage() {
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
  const { data: dbFacts = [] } = useQuery<Fact[]>({
    queryKey: ["/api/facts"],
  });

  // Filter database facts to only include History category and convert to CategoryFact format
  const databaseHistoryFacts: CategoryFact[] = useMemo(() => {
    return dbFacts
      .filter(fact => fact.categories.includes("History"))
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

  // Merge static facts with database facts (database facts appear after static ones)
  const allHistoryFacts = useMemo(() => {
    // Get IDs of static facts to avoid duplicates
    const staticIds = new Set(historyFacts.map(f => f.id));
    // Filter out any database facts that might have same ID as static ones
    const uniqueDbFacts = databaseHistoryFacts.filter(f => !staticIds.has(f.id));
    return [...historyFacts, ...uniqueDbFacts];
  }, [databaseHistoryFacts]);

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
  const sortedFacts = [...allHistoryFacts].sort((a, b) => {
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
    <div className="history-page">
      <SEO 
        title="Misconceptions About History" 
        description="What have you learned about historical figures or societies that isn't true? Separate fact from legend in history's most persistent myths." 
      />
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav activeCategory="HISTORY" sticky />

      <main className="history-main-content">
        <div className="history-intro-row">
          <div className="history-description">
            <h1 className="category-page-h1" data-testid="text-category-title">All Misconceptions In History</h1>
            <h2 className="category-page-h2" data-testid="text-category-subtitle">Your school history lessons might have left out certain critical perspectives.</h2>
            <p>
              What we know about history is always evolving as new archaelogical records surface, modern analytical tools reinterpret old texts, and previously overlooked, marginalized voices finally become heard.
            
             The media further exacerbated historical myths with its exaggerated or inaccurate portrayals of several societies. </p>
              
              <p><b>Note:</b> Certain historical events may be taught differently depending on where you grew up.</p>

            
          </div>
        </div>

        <div className="history-content-area" id="history-content-area">
          <div className="history-tabs-row">
            <div className="history-key-container">
              <FactKey />
            </div>
            <SortSelector selectedSort={sortOption} onSortChange={handleSortChange} />
            <div className="history-filter-container">
              <CategoryFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={handleFilterChange} 
              />
            </div>
          </div>

          <div className="history-content-container">
            <div className="history-facts-column">
              {filteredFacts.length === 0 && selectedFilters.length > 0 ? (
                <EmptyFilterState />
              ) : (
                <>
                  <div className="history-facts-grid">
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
                    scrollTargetId="history-content-area"
                  />
                </>
              )}
            </div>

            <aside className="history-sidebar">
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
            category: "HISTORY",
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
