import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Fact, FactWithCommentCount } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { SortSelector, type SortOption } from "@/components/SortSelector";
import { CirculationFilter } from "@/components/CirculationFilter";
import { CategoryFactCard, type CategoryFact } from "@/components/CategoryFactCard";
import { SourcesModal } from "@/components/SourcesModal";
import { FactKey } from "@/components/FactKey";
import { SendgridBanner } from "@/components/SendgridBanner";
import { SaveModal } from "@/components/SaveModal";
import { useAuth } from "@/lib/auth";
import { useSavedFacts } from "@/lib/useSavedFacts";
import { ShareModal } from "@/components/ShareModal";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { EmptyFilterState } from "@/components/EmptyFilterState";
import "./EarthSciencePage.css";

const SUBCATEGORY_COLOR = "#2C2C2C";

export default function EarthSciencePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["still-circulating", "in-the-past"]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<CategoryFact | null>(null);
  const [sourcesModalFactId, setSourcesModalFactId] = useState<string | null>(null);
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const { savedFactIds, toggleSave } = useSavedFacts(isLoggedIn);
  const queryClient = useQueryClient();

  const { data: dbFacts = [], isLoading } = useQuery<FactWithCommentCount[]>({
    queryKey: ["/api/facts"],
  });

  const allFacts: CategoryFact[] = useMemo(() => {
    return dbFacts
      .filter(fact => fact.subcategories?.includes("Earth Science"))
      .map(fact => ({
        id: fact.id,
        myth: fact.mythHeader,
        truth: fact.truthHeader,
        factFilters: fact.factFilters || [],
        dateAdded: fact.createdAt ? new Date(fact.createdAt).toISOString().split('T')[0] : undefined,
        link: `/fact/${fact.slug}`,
        coverPhoto: fact.coverPhoto || undefined,
        betaOnly: fact.betaOnly ?? false,
        revisionYear: fact.revisionYear ?? undefined,
        taughtUntilYear: fact.taughtUntilYear ?? undefined,
        originDecade: fact.originDecade ?? undefined,
        commentCount: fact.commentCount ?? 0,
      }));
  }, [dbFacts]);

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

  const sortedFacts = [...allFacts].sort((a, b) => {
    if (!a.dateAdded || !b.dateAdded) return 0;
    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
  });

  const filteredFacts = sortedFacts.filter(fact => {
    const isPhased = !!fact.taughtUntilYear;
    if (isPhased) return selectedFilters.includes("in-the-past");
    return selectedFilters.includes("still-circulating");
  });

  return (
    <div className="earth-science-page">
      <SEO 
        title="Earth Science" 
        description="Explore misconceptions about geology, weather, climate, and our planet. Discover what science says about Earth." 
      />
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav activeCategory="OTHER" sticky />

      <main className="earth-science-main-content">
        <Link 
          href="/category/other" 
          className="earth-science-breadcrumb"
          data-testid="link-back-other"
        >
          <ArrowLeft size={18} />
          <span>Other categories</span>
        </Link>

        <div className="earth-science-header-section">
          <h1 className="category-page-h1">All Common Misconceptions In Earth Science</h1>
        </div>

        <div className="earth-science-content-area">
          <div className="earth-science-tabs-row">
            <div className="earth-science-key-container">
              <FactKey />
            </div>
            <SortSelector selectedSort={sortOption} onSortChange={setSortOption} />
            <div className="earth-science-filter-container">
              <CirculationFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={setSelectedFilters} 
              />
            </div>
          </div>

          <div className="earth-science-content-container">
            <div className="earth-science-facts-column">
              {isLoading ? (
                <div className="earth-science-loading-state" data-testid="loading-state">
                  <img 
                    src="/loading-bar.gif" 
                    alt="" 
                    className="earth-science-loading-logo"
                    data-testid="img-loading-logo"
                  />
                </div>
              ) : filteredFacts.length === 0 ? (
                <EmptyFilterState />
              ) : (
                <div className="earth-science-facts-grid">
                  {filteredFacts.map((fact) => (
                    <CategoryFactCard
                      key={fact.id}
                      fact={fact}
                      categoryColor={SUBCATEGORY_COLOR}
                      onSave={() => handleSaveClick(fact.id)}
                      onShare={() => handleShareClick(fact)}
                      onComment={handleCommentClick}
                      onBetaClick={handleBetaClick}
                      isSaved={savedFactIds.has(fact.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <aside className="earth-science-sidebar">
              <SendgridBanner hideMascot />
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
            category: "EARTH SCIENCE",
            categoryColor: SUBCATEGORY_COLOR,
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
