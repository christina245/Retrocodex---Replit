import { Fragment, useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Fact, FactWithCommentCount } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { HeaderDark as Header } from "@/components/HeaderDark";
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
import { Footer } from "@/components/Footer";
import { CirculationFilter } from "@/components/CirculationFilter";
import { Pagination } from "@/components/Pagination";
import { EmptyFilterState } from "@/components/EmptyFilterState";
import { ScrungyBooksPromo } from "@/components/ScrungyBooksPromo";
import { InFeedAd } from "@/components/InFeedAd";
import { DisplayAd } from "@/components/DisplayAd";
import "./GenderSexualityPage.css";

const FACTS_PER_PAGE = 10;

import photoGenderBrains from "@assets/stock_images/men vs women.png";

const genderSexualityFacts: CategoryFact[] = [
  
];

const CATEGORY_COLOR = "#FF88AA";

export default function GenderSexualityPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["still-circulating", "in-the-past"]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<CategoryFact | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const el = document.getElementById("gender-sexuality-content-area");
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
        revisionYear: fact.revisionYear ?? undefined,
        taughtUntilYear: fact.taughtUntilYear ?? undefined,
        originDecade: fact.originDecade ?? undefined,
        commentCount: fact.commentCount ?? 0,
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


  // Sort facts by most recently added (only enabled sort option for now)
  const sortedFacts = [...allGenderFacts].sort((a, b) => {
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
    <div className="gender-sexuality-page">
      <SEO 
        title="Misconceptions About Gender & Sexuality" 
        description="Explore misconceptions about gender, sexuality, and relationships. Discover evidence-based perspectives on common beliefs." 
      />
      <Header onMenuClick={() => setIsMenuOpen(true)} hideTagline />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav activeCategory="GENDER & SEXUALITY" sticky />

      <main className="gender-sexuality-main-content">
        <div className="gender-sexuality-intro-row">
          <div className="gender-sexuality-description">
            <h1 className="category-page-h1" data-testid="text-category-title">All Common Misconceptions In Gender & Sexuality</h1>
            <h2 className="category-page-h2" data-testid="text-category-subtitle">They've never been as binary as what many of us would like to believe.</h2>
              <p> Throughout history, myths in gender and sexuality were often formed through prejudice, rigid social norms, superficial assumptions, or the attempt to reinforce power structures rather than scientific or historical data. The exclusion of women and sexual minorities from scientific and cultural authority further slowed progress towards understanding these complex topics.
            </p>
            <p>
              <b>Note:</b> To keep Retrocodex family-friendly, sexually explicit facts will be featured on a future page.
            </p>
          </div>
          <div className="gender-sexuality-scrungy-promo-wrapper">
            <ScrungyBooksPromo />
          </div>
        </div>

        <div className="gender-sexuality-content-area" id="gender-sexuality-content-area">
          <div className="gender-sexuality-tabs-row">
            <div className="gender-sexuality-key-container">
              <FactKey />
            </div>
            <SortSelector selectedSort={sortOption} onSortChange={handleSortChange} />
            <div className="gender-sexuality-filter-container">
              <CirculationFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={handleFilterChange} 
              />
            </div>
          </div>

          <div className="gender-sexuality-content-container">
            <div className="gender-sexuality-facts-column">
              {factsLoading ? (
                <div style={{ display: "flex", justifyContent: "center", paddingTop: "40px" }}>
                  <img src="/loading-bar.gif" style={{ width: "500px", maxWidth: "100%", height: "auto" }} alt="" />
                </div>
              ) : filteredFacts.length === 0 ? (
                <EmptyFilterState />
              ) : (
                <>
                  <div className="gender-sexuality-facts-grid">
                    {displayedFacts.map((fact, index) => {
                      const hasFirstAd = displayedFacts.length > 3;
                      const totalGridSlots = displayedFacts.length + (hasFirstAd ? 1 : 0);
                      const needsTrailingAd = totalGridSlots % 2 !== 0;
                      const isLastCard = index === displayedFacts.length - 1;
                      return (
                        <Fragment key={fact.id}>
                          {isLastCard && needsTrailingAd && <InFeedAd adSlot="1126276141" layoutKey="-fi+4+38-lk+vb" />}
                          <CategoryFactCard
                            fact={fact}
                            categoryColor={CATEGORY_COLOR}
                            onSave={() => handleSaveClick(fact.id)}
                            onShare={() => handleShareClick(fact)}
                            onComment={handleCommentClick}
                            isSaved={savedFactIds.has(fact.id)}
                          />
                          {index === 3 && <InFeedAd adSlot="9609281726" layoutKey="-fi+4+38-lk+vb" />}
                        </Fragment>
                      );
                    })}
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    scrollTargetId="__noscroll__"
                  />
                  <div className="gender-sexuality-display-ad-row">
                    <DisplayAd adSlot="1730791706" />
                  </div>
                </>
              )}
            </div>

            <aside className="gender-sexuality-sidebar">
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
