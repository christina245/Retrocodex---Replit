import { useState, useMemo, useEffect, useRef } from "react";
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
import { CirculationFilter } from "@/components/CirculationFilter";
import { Pagination } from "@/components/Pagination";
import { EmptyFilterState } from "@/components/EmptyFilterState";
import { ScrungyBooksPromo } from "@/components/ScrungyBooksPromo";
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
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["still-circulating", "in-the-past"]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<CategoryFact | null>(null);
  const [sourcesModalFactId, setSourcesModalFactId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const el = document.getElementById("social-sciences-content-area");
    if (!el) return;
    const timer = setTimeout(() => {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
  }, [currentPage]);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();
  const { savedFactIds, toggleSave } = useSavedFacts(isLoggedIn);

  const { data: dbFacts = [], isLoading: factsLoading } = useQuery<FactWithCommentCount[]>({
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
        revisionYear: fact.revisionYear ?? undefined,
        taughtUntilYear: fact.taughtUntilYear ?? undefined,
        originDecade: fact.originDecade ?? undefined,
        commentCount: fact.commentCount ?? 0,
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
  const sortedFacts = [...allSocialSciencesFacts].sort((a, b) => {
    if (!a.dateAdded || !b.dateAdded) return 0;
    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
  });

  // Apply filters
  const filteredFacts = sortedFacts.filter(fact => {
    const isPhased = !!fact.taughtUntilYear;
    if (isPhased) return selectedFilters.includes("in-the-past");
    return selectedFilters.includes("still-circulating");
  });

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
    <div className="social-sciences-page">
      <SEO 
        title="Misconceptions In Social Sciences" 
        description="Examine misconceptions about human behavior, society, and culture." 
      />
      <Header onMenuClick={() => setIsMenuOpen(true)} hideTagline />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav activeCategory="SOCIAL SCIENCES" sticky />

      <main className="social-sciences-main-content">
        <div className="social-sciences-intro-row">
          <div className="social-sciences-description">
            <h1 className="category-page-h1" data-testid="text-category-title">All Common Misconceptions In Social Sciences</h1>
            <h2 className="category-page-h2" data-testid="text-category-subtitle">The way humans work isn't as simple as what the media portrays.</h2>
            <p>
              Throughout history, daily human interaction made it too easy for us to form assumptions about each other. This intuition ingrained such powerful mental biases that they shaped entire fields of study.
            These misconceptions in psychology, sociology, economics, and more were often based on limited data, cultural biases, social prejudice and inequality, or just a narrow range of personal experiences and the instinctual expectations that followed.
            </p>
          </div>
          <div className="social-sciences-scrungy-promo-wrapper">
            <ScrungyBooksPromo />
          </div>
        </div>

        <div className="social-sciences-content-area" id="social-sciences-content-area">
          <div className="social-sciences-tabs-row">
            <div className="social-sciences-key-container">
              <FactKey />
            </div>
            <SortSelector selectedSort={sortOption} onSortChange={handleSortChange} />
            <div className="social-sciences-filter-container">
              <CirculationFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={handleFilterChange} 
              />
            </div>
          </div>

          <div className="social-sciences-content-container">
            <div className="social-sciences-facts-column">
              {factsLoading ? (
                <div style={{ display: "flex", justifyContent: "center", paddingTop: "40px" }}>
                  <img src="/loading-bar.gif" style={{ width: "500px", maxWidth: "100%", height: "auto" }} alt="" />
                </div>
              ) : filteredFacts.length === 0 ? (
                <EmptyFilterState />
              ) : (
                <>
                  <div className="social-sciences-facts-grid">
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
                    scrollTargetId="__noscroll__"
                  />
                </>
              )}
            </div>

            <aside className="social-sciences-sidebar">
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
            category: "SOCIAL SCIENCES",
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
