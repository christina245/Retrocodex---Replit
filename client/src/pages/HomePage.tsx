import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { HomepageTabs, type HomepageTabType } from "@/components/HomepageTabs";
import { FactCard, type Fact } from "@/components/FactCard";
import { FactKey } from "@/components/FactKey";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SortSelector, type SortOption } from "@/components/SortSelector";
import { CATEGORIES } from "@shared/categories";
import { SendgridBanner } from "@/components/SendgridBanner";
import { ShareModal } from "@/components/ShareModal";
import { SignInModal } from "@/components/SignInModal";
import { SourcesModal } from "@/components/SourcesModal";
import { Footer } from "@/components/Footer";
import { Pagination } from "@/components/Pagination";
import { SEO } from "@/components/SEO";
import type { Fact as DbFact } from "@shared/schema";
import { DECADES } from "@shared/schema";
import { ArrowBigDownDash } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSavedFacts } from "@/lib/useSavedFacts";
import { useVerificationGuard } from "@/lib/useVerificationGuard";
import { VerifyEmailModal } from "@/components/VerifyEmailModal";
import "./HomePage.css";

const FACTS_PER_PAGE = 10;
const DECADE_FACTS_PER_PAGE = 20;
const MAX_RECENT_FACTS = 30;


const CATEGORY_COLORS: Record<string, string> = {
  "History": "#D29E00",
  "Life Sciences": "#419F36",
  "Health & Fitness": "#EC7200",
  "Social Sciences": "#9D0085",
  "Gender & Sexuality": "#FF6F98",
  "Everyday Life": "#0167A2",
  "Other": "#2C2C2C",
};

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<HomepageTabType>("explore");
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInContext, setSignInContext] = useState<string | undefined>(undefined);
  const [shareModalFact, setShareModalFact] = useState<Fact | null>(null);
  const [sourcesModalFactId, setSourcesModalFactId] = useState<string | null>(null);
  const [recentPage, setRecentPage] = useState(1);
  const [popularPage, setPopularPage] = useState(1);
  const [selectedDecade, setSelectedDecade] = useState<string>("all");
  const [isDecadeLoading, setIsDecadeLoading] = useState(false);
  const [decadeFilters, setDecadeFilters] = useState<string[]>([]);
  const [decadeSort, setDecadeSort] = useState<SortOption>("recent");
  const [decadePage, setDecadePage] = useState(1);
  const [decadeCategoryFilter, setDecadeCategoryFilter] = useState<string[]>([]);
  const [decadeTypeToggles, setDecadeTypeToggles] = useState({ school: true, folkWisdom: true, mediaClaims: false });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();
  const { savedFactIds, toggleSave } = useSavedFacts(isLoggedIn);
  const { showVerifyModal, setShowVerifyModal, requireVerified } = useVerificationGuard();
  const [, setLocation] = useLocation();
  const params = useParams<{ decade?: string }>();

  type DbFactWithCount = DbFact & { commentCount?: number };

  const { data: dbFacts = [], isLoading: isFactsLoading } = useQuery<DbFactWithCount[]>({
    queryKey: ["/api/facts"],
  });

  const { data: popularDbFacts = [] } = useQuery<DbFactWithCount[]>({
    queryKey: ["/api/facts/popular"],
  });

  const recentDbFacts: Fact[] = useMemo(() => {
    return [...dbFacts]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, MAX_RECENT_FACTS)
      .map(fact => {
        const primaryCategory = fact.categories[0] || "Other";
        const categoryDisplay = (primaryCategory === "Other" && fact.subcategories?.[0])
          ? `OTHER • ${fact.subcategories[0].toUpperCase()}`
          : primaryCategory.toUpperCase();
        return {
          id: fact.id,
          category: categoryDisplay,
          categoryColor: CATEGORY_COLORS[primaryCategory] || "#2C2C2C",
          myth: fact.mythHeader,
          truth: fact.truthHeader,
          dateAdded: fact.createdAt ? new Date(fact.createdAt).toISOString().split('T')[0] : undefined,
          link: `/fact/${fact.slug}`,
          coverPhoto: fact.coverPhoto || undefined,
          betaOnly: fact.betaOnly || false,
          factFilters: fact.factFilters || undefined,
          revisionYear: fact.revisionYear ?? undefined,
          taughtUntilYear: fact.taughtUntilYear ?? undefined,
          originDecade: fact.originDecade ?? undefined,
          commentCount: fact.commentCount ?? 0,
        };
      });
  }, [dbFacts]);

  const recentTotalPages = Math.max(1, Math.ceil(recentDbFacts.length / FACTS_PER_PAGE));
  const clampedRecentPage = Math.min(recentPage, recentTotalPages);
  const paginatedRecentFacts = recentDbFacts.slice(
    (clampedRecentPage - 1) * FACTS_PER_PAGE,
    clampedRecentPage * FACTS_PER_PAGE
  );

  const popularFacts: Fact[] = useMemo(() => {
    return popularDbFacts.map(fact => {
      const primaryCategory = fact.categories[0] || "Other";
      const categoryDisplay = (primaryCategory === "Other" && fact.subcategories?.[0])
        ? `OTHER • ${fact.subcategories[0].toUpperCase()}`
        : primaryCategory.toUpperCase();
      return {
        id: fact.id,
        category: categoryDisplay,
        categoryColor: CATEGORY_COLORS[primaryCategory] || "#2C2C2C",
        myth: fact.mythHeader,
        truth: fact.truthHeader,
        dateAdded: fact.createdAt ? new Date(fact.createdAt).toISOString().split('T')[0] : undefined,
        link: `/fact/${fact.slug}`,
        coverPhoto: fact.coverPhoto || undefined,
        betaOnly: fact.betaOnly || false,
        factFilters: fact.factFilters || undefined,
        revisionYear: fact.revisionYear ?? undefined,
        taughtUntilYear: fact.taughtUntilYear ?? undefined,
        originDecade: fact.originDecade ?? undefined,
        commentCount: fact.commentCount ?? 0,
      };
    });
  }, [popularDbFacts]);

  const popularTotalPages = Math.max(1, Math.ceil(popularFacts.length / FACTS_PER_PAGE));
  const clampedPopularPage = Math.min(popularPage, popularTotalPages);
  const paginatedPopularFacts = popularFacts.slice(
    (clampedPopularPage - 1) * FACTS_PER_PAGE,
    clampedPopularPage * FACTS_PER_PAGE
  );

  const featuredFacts: Fact[] = useMemo(() => {
    return dbFacts
      .filter(fact => fact.featured)
      .map(fact => {
        const primaryCategory = fact.categories[0] || "Other";
        const categoryDisplay = (primaryCategory === "Other" && fact.subcategories?.[0])
          ? `OTHER • ${fact.subcategories[0].toUpperCase()}`
          : primaryCategory.toUpperCase();
        return {
          id: fact.id,
          category: categoryDisplay,
          categoryColor: CATEGORY_COLORS[primaryCategory] || "#2C2C2C",
          myth: fact.mythHeader,
          truth: fact.truthHeader,
          dateAdded: fact.createdAt ? new Date(fact.createdAt).toISOString().split('T')[0] : undefined,
          link: `/fact/${fact.slug}`,
          coverPhoto: fact.coverPhoto || undefined,
          betaOnly: fact.betaOnly || false,
          factFilters: fact.factFilters || undefined,
          revisionYear: fact.revisionYear ?? undefined,
          taughtUntilYear: fact.taughtUntilYear ?? undefined,
          originDecade: fact.originDecade ?? undefined,
          commentCount: fact.commentCount ?? 0,
        };
      });
  }, [dbFacts]);

  const handleTabChange = (tab: HomepageTabType) => {
    setActiveTab(tab);
    setRecentPage(1);
    setPopularPage(1);
  };

  const handleRecentPageChange = (page: number) => {
    setRecentPage(Math.min(page, recentTotalPages));
  };

  const handlePopularPageChange = (page: number) => {
    setPopularPage(Math.min(page, popularTotalPages));
  };

  useEffect(() => {
    if (recentPage > recentTotalPages) {
      setRecentPage(Math.max(1, recentTotalPages));
    }
  }, [recentTotalPages, recentPage]);

  useEffect(() => {
    if (popularPage > popularTotalPages) {
      setPopularPage(Math.max(1, popularTotalPages));
    }
  }, [popularTotalPages, popularPage]);

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
      setSignInContext("Sign in to save this fact to your collection.");
      setShowSignIn(true);
      return;
    }
    requireVerified(() => toggleSave(factId));
  };

  const handleShareClick = (fact: Fact) => {
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

  useEffect(() => {
    const urlDecade = params.decade;
    if (urlDecade && DECADES.includes(urlDecade as typeof DECADES[number])) {
      setSelectedDecade(urlDecade);
    } else {
      setSelectedDecade("all");
    }
  }, [params.decade]);

  const handleDecadeClick = useCallback((decade: string) => {
    if (selectedDecade === decade) {
      setLocation("/");
    } else {
      setLocation(`/decade/${decade}`);
    }
  }, [selectedDecade, setLocation]);

  useEffect(() => {
    if (selectedDecade !== "all") {
      setIsDecadeLoading(true);
      setDecadePage(1);
      setDecadeTypeToggles({ school: true, folkWisdom: true, mediaClaims: false });
      const timer = setTimeout(() => setIsDecadeLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedDecade]);

  useEffect(() => {
    if (selectedDecade === "all") return;
    const el = document.getElementById("decade-content-area");
    if (!el) return;
    const timer = setTimeout(() => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
  }, [decadePage, selectedDecade]);

  const decadeFacts: Fact[] = useMemo(() => {
    if (selectedDecade === "all") return [];
    const FACT_TYPE_KEYS = ["school", "folk wisdom", "media claims"];
    return dbFacts
      .filter(fact => {
        if (fact.originDecade && fact.originDecade > selectedDecade) return false;
        if (fact.taughtUntilYear && fact.taughtUntilYear < selectedDecade) return false;
        if (decadeFilters.length > 0) {
          const filters = fact.factFilters || [];
          const matches = decadeFilters.some(df =>
            filters.some(f => f.toLowerCase() === df.toLowerCase())
          );
          if (!matches) return false;
        }
        if (decadeCategoryFilter.length > 0) {
          const cats = (fact.categories || []).map(c => c.toLowerCase());
          if (!decadeCategoryFilter.some(f => cats.includes(f.toLowerCase()))) return false;
        }
        // Fact Type toggle filter — strict explicit matching
        // Untagged facts never pass. Tagged facts must match at least one active toggle.
        const factTypesOnFact = (fact.factFilters || [])
          .map(f => f.toLowerCase())
          .filter(f => FACT_TYPE_KEYS.includes(f));
        if (factTypesOnFact.length === 0) return false;
        const matchesToggle =
          (decadeTypeToggles.school && factTypesOnFact.includes("school")) ||
          (decadeTypeToggles.folkWisdom && factTypesOnFact.includes("folk wisdom")) ||
          (decadeTypeToggles.mediaClaims && factTypesOnFact.includes("media claims"));
        if (!matchesToggle) return false;
        return true;
      })
      .sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      })
      .map(fact => {
        const primaryCategory = fact.categories[0] || "Other";
        const categoryDisplay = (primaryCategory === "Other" && fact.subcategories?.[0])
          ? `OTHER • ${fact.subcategories[0].toUpperCase()}`
          : primaryCategory.toUpperCase();
        const catConfig = CATEGORIES.find(c => c.name.toLowerCase() === primaryCategory.toLowerCase());
        return {
          id: fact.id,
          category: categoryDisplay,
          categoryColor: catConfig?.color || "#2C2C2C",
          myth: fact.mythHeader,
          truth: fact.truthHeader,
          dateAdded: fact.createdAt ? new Date(fact.createdAt).toISOString().split('T')[0] : undefined,
          link: `/fact/${fact.slug}`,
          coverPhoto: fact.coverPhoto || undefined,
          betaOnly: fact.betaOnly || false,
          factFilters: fact.factFilters || undefined,
          revisionYear: fact.revisionYear ?? undefined,
          taughtUntilYear: fact.taughtUntilYear ?? undefined,
          originDecade: fact.originDecade ?? undefined,
          commentCount: fact.commentCount ?? 0,
        };
      });
  }, [dbFacts, selectedDecade, decadeFilters, decadeCategoryFilter, decadeTypeToggles]);

  const decadeTotalPages = Math.max(1, Math.ceil(decadeFacts.length / DECADE_FACTS_PER_PAGE));
  const clampedDecadePage = Math.min(decadePage, decadeTotalPages);
  const paginatedDecadeFacts = decadeFacts.slice(
    (clampedDecadePage - 1) * DECADE_FACTS_PER_PAGE,
    clampedDecadePage * DECADE_FACTS_PER_PAGE
  );

  const regionallyTaughtFacts: Fact[] = useMemo(() => {
    return dbFacts
      .filter(fact => {
        const filters = fact.factFilters || [];
        return filters.some((f: string) => f.toLowerCase() === "regionally taught");
      })
      .map(fact => {
        const primaryCategory = fact.categories[0] || "Other";
        const categoryDisplay = (primaryCategory === "Other" && fact.subcategories?.[0])
          ? `OTHER • ${fact.subcategories[0].toUpperCase()}`
          : primaryCategory.toUpperCase();
        return {
          id: fact.id,
          category: categoryDisplay,
          categoryColor: CATEGORY_COLORS[primaryCategory] || "#2C2C2C",
          myth: fact.mythHeader,
          truth: fact.truthHeader,
          dateAdded: fact.createdAt ? new Date(fact.createdAt).toISOString().split('T')[0] : undefined,
          link: `/fact/${fact.slug}`,
          coverPhoto: fact.coverPhoto || undefined,
          betaOnly: fact.betaOnly || false,
          factFilters: fact.factFilters || undefined,
          revisionYear: fact.revisionYear ?? undefined,
          taughtUntilYear: fact.taughtUntilYear ?? undefined,
          originDecade: fact.originDecade ?? undefined,
          commentCount: fact.commentCount ?? 0,
        };
      });
  }, [dbFacts]);

  const trendingFacts: Fact[] = useMemo(() => {
    return dbFacts
      .filter(fact => fact.isTrending)
      .map(fact => {
        const primaryCategory = fact.categories[0] || "Other";
        const categoryDisplay = (primaryCategory === "Other" && fact.subcategories?.[0])
          ? `OTHER • ${fact.subcategories[0].toUpperCase()}`
          : primaryCategory.toUpperCase();
        return {
          id: fact.id,
          category: categoryDisplay,
          categoryColor: CATEGORY_COLORS[primaryCategory] || "#2C2C2C",
          myth: fact.mythHeader,
          truth: fact.truthHeader,
          dateAdded: fact.createdAt ? new Date(fact.createdAt).toISOString().split('T')[0] : undefined,
          link: `/fact/${fact.slug}`,
          coverPhoto: fact.coverPhoto || undefined,
          betaOnly: fact.betaOnly || false,
          factFilters: fact.factFilters || undefined,
          revisionYear: fact.revisionYear ?? undefined,
          taughtUntilYear: fact.taughtUntilYear ?? undefined,
          originDecade: fact.originDecade ?? undefined,
          commentCount: fact.commentCount ?? 0,
        };
      });
  }, [dbFacts]);

  const debatedFacts: Fact[] = useMemo(() => {
    return dbFacts
      .filter(fact => fact.isDebated)
      .map(fact => {
        const primaryCategory = fact.categories[0] || "Other";
        const categoryDisplay = (primaryCategory === "Other" && fact.subcategories?.[0])
          ? `OTHER • ${fact.subcategories[0].toUpperCase()}`
          : primaryCategory.toUpperCase();
        return {
          id: fact.id,
          category: categoryDisplay,
          categoryColor: CATEGORY_COLORS[primaryCategory] || "#2C2C2C",
          myth: fact.mythHeader,
          truth: fact.truthHeader,
          dateAdded: fact.createdAt ? new Date(fact.createdAt).toISOString().split('T')[0] : undefined,
          link: `/fact/${fact.slug}`,
          coverPhoto: fact.coverPhoto || undefined,
          betaOnly: fact.betaOnly || false,
          factFilters: fact.factFilters || undefined,
          revisionYear: fact.revisionYear ?? undefined,
          taughtUntilYear: fact.taughtUntilYear ?? undefined,
          originDecade: fact.originDecade ?? undefined,
          commentCount: fact.commentCount ?? 0,
        };
      });
  }, [dbFacts]);

  const getDisplayedFacts = (): Fact[] => {
    switch (activeTab) {
      case "explore":
        return featuredFacts;
      case "new":
        return paginatedRecentFacts;
      case "popular":
        return paginatedPopularFacts;
      case "regionally-taught":
        return regionallyTaughtFacts;
      case "current-events":
        return trendingFacts;
      case "debated":
        return debatedFacts;
      default:
        return [];
    }
  };

  const displayedFacts = getDisplayedFacts();

  const showRecentPagination = activeTab === "new" && recentTotalPages > 1;
  const showPopularPagination = activeTab === "popular" && popularTotalPages > 1;
  const showEmptyState = displayedFacts.length === 0;
  const emptyStateMessage = (activeTab === "current-events" || activeTab === "debated") 
    ? "No facts have been added, check back later!"
    : (activeTab === "regionally-taught")
      ? "No regionally taught facts available yet. Check back soon!"
      : (activeTab === "popular")
        ? "No popular facts have been added yet. Check back soon!"
        : "No facts available yet. Check back soon!";

  return (
    <div className="page-wrapper">
      <SEO 
        title="Retrocodex: Stuff You Might Have Learned Wrong"
        description="What have you been taught that's actually untrue? Explore a library of myths and misconceptions across history, life sciences, health and fitness, gender, and more."
      />
      <Header onMenuClick={() => setIsMenuOpen(true)} hideTagline />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <main className="main-content">
        <h1 className="homepage-headline" data-testid="text-homepage-headline">
          What have you learned that's <u>now <em>outdated</em></u>?
        </h1>
        <p className="homepage-tagline" data-testid="text-homepage-tagline">
          Pick the decade you graduated high school below. Discover what you may have been taught that has since been disproven or revised.
        </p>

        <nav className="homepage-decade-nav" data-testid="homepage-decade-nav">
          <div className="homepage-decade-nav-container">
            <button
              className={`homepage-decade-chip${selectedDecade === "all" ? " homepage-decade-chip-selected" : ""}`}
              onClick={() => setLocation("/")}
              data-testid="button-decade-all"
            >
              {selectedDecade === "all" && (
                <ArrowBigDownDash size={18} color="currentColor" style={{ marginRight: 6, verticalAlign: "middle" }} />
              )}
              View all topics
            </button>
            {DECADES.filter(d => d >= "1950s").map((decade) => (
              <button
                key={decade}
                className={`homepage-decade-chip${selectedDecade === decade ? " homepage-decade-chip-selected" : ""}`}
                onClick={() => handleDecadeClick(decade)}
                data-testid={`button-decade-${decade}`}
              >
                {decade}
              </button>
            ))}
          </div>
        </nav>

        {selectedDecade === "all" ? (
          <>
            <p className="homepage-category-subtitle" data-testid="text-category-subtitle">
              Or browse all topics by category:
            </p>

            <HomepageCategoryNav />
            <HomepageTabs activeTab={activeTab} onTabChange={handleTabChange} />

            <div className="content-area" id="content-area">
              {activeTab === "regionally-taught" && (
                <p className="tab-subheader" data-testid="text-regionally-taught-subheader">
                  Regionally Taught topics explore beliefs and narratives passed down in specific countries, states, regions, <br /> or communities shaped by local history and culture.
                </p>
              )}
              {activeTab === "popular" && (
                <p className="tab-subheader" data-testid="text-popular-subheader">
                  Popular topics are frequently reported by social media users on{" "}
                  <a
                    href="https://www.reddit.com/r/AskReddit/comments/1789w9u/whats_a_fact_that_was_taught_in_school_thats_been/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tab-subheader-link"
                  >
                    Reddit
                  </a>{" "}
                  and Instagram.
                </p>
              )}
              {activeTab === "current-events" && (
                <p className="tab-subheader" data-testid="text-current-events-subheader">
                  Current Events topics reflect contemporary misinformation spreading through social media and news media.
                </p>
              )}
              {activeTab === "debated" && (
                <p className="tab-subheader" data-testid="text-debated-subheader">
                  Debated topics feature competing evidence or visibly ongoing disagreement among experts and the public.
                </p>
              )}
              <div className="key-container">
                <FactKey />
              </div>

              <div className="content-container">
                <div className="facts-column">
                  <div className="facts-grid">
                    {!showEmptyState ? (
                      displayedFacts.map((fact) => (
                        <FactCard
                          key={fact.id}
                          fact={fact}
                          onSave={() => handleSaveClick(fact.id)}
                          onShare={() => handleShareClick(fact)}
                          onComment={handleCommentClick}
                          onBetaClick={handleBetaClick}
                          isSaved={savedFactIds.has(fact.id)}
                          showTaughtUntilLabel
                        />
                      ))
                    ) : activeTab === "explore" && isFactsLoading ? (
                      <div className="decade-loading-state" data-testid="featured-loading">
                        <img src="/loading_bar_gif_cotton_1776663498184.gif" className="decade-loading-gif" alt="" />
                      </div>
                    ) : (
                      <div className="empty-state" data-testid="empty-facts">
                        <p>{emptyStateMessage}</p>
                      </div>
                    )}
                  </div>
                  {showRecentPagination && (
                    <Pagination
                      currentPage={clampedRecentPage}
                      totalPages={recentTotalPages}
                      onPageChange={handleRecentPageChange}
                      scrollTargetId="content-area"
                    />
                  )}
                  {showPopularPagination && (
                    <Pagination
                      currentPage={clampedPopularPage}
                      totalPages={popularTotalPages}
                      onPageChange={handlePopularPageChange}
                      scrollTargetId="content-area"
                    />
                  )}
                </div>

                <aside className="sidebar">
                  <SendgridBanner />
                </aside>
              </div>
            </div>
          </>
        ) : (
          <>
            {isDecadeLoading ? (
              <div className="decade-loading-state" data-testid="decade-loading">
                <img src="/loading_bar_gif_cotton_1776663498184.gif" className="decade-loading-gif" alt="" />
                <p className="decade-loading-text">Generating your {selectedDecade} results…</p>
              </div>
            ) : (
              <div className="decade-content-area" id="decade-content-area">
                <div className="decade-disclaimers">
                  <p className="decade-disclaimer-item">
                    <span className="decade-disclaimer-icon">⚠️</span>
                    This list includes facts that were factually disproven before you graduated, but continued to persist in popular culture or academia. 
                  </p>
                  <p className="decade-disclaimer-item">
                    <span className="decade-disclaimer-icon">🌎</span>
                    Since what each person is taught can vary depending on where we're from, this list might not fully represent your lived experience. To improve accuracy, all topics are continuously revised through user submissions and commentary.
                  </p>
                </div>

                <div className="decade-divider" />

                <div className="decade-main-layout">
                  <aside className="decade-type-sidebar">
                    <div className="decade-header-text">
                      <span className="decade-header-line">If you graduated from high school in the</span>
                      <span className="decade-header-year">{selectedDecade},</span>
                      <span className="decade-header-line">here's what changed since:</span>
                    </div>
                    <div className="decade-type-card">
                      <div className="decade-type-card-head">Fact Type</div>
                      {([
                        { key: "school" as const, label: "Taught In School", sub: "Facts from your teachers that are now outdated." },
                        { key: "folkWisdom" as const, label: "Folk Wisdom", sub: "Informal lessons from family, community, or pop culture." },
                        { key: "mediaClaims" as const, label: "Media Claims", sub: "Misinformation commonly circulating through 2026's news media and social media." },
                      ]).map(({ key, label, sub }) => (
                        <button
                          key={key}
                          className="decade-type-toggle-item"
                          onClick={() => { setDecadeTypeToggles(prev => ({ ...prev, [key]: !prev[key] })); setDecadePage(1); }}
                          data-testid={`toggle-fact-type-${key}`}
                        >
                          <div className="decade-type-toggle-label">
                            <span className="decade-type-toggle-name">{label}</span>
                            <span className="decade-type-toggle-sub">{sub}</span>
                          </div>
                          <div className={`decade-type-toggle-switch${decadeTypeToggles[key] ? " decade-type-toggle-on" : ""}`}>
                            <div className="decade-type-toggle-thumb" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </aside>

                  <div className="decade-facts-column">
                    <div className="decade-controls-bar">
                      <FactKey />
                      <div className="decade-sort-filter">
                        <SortSelector selectedSort={decadeSort} onSortChange={setDecadeSort} />
                        <CategoryFilter selectedFilters={decadeFilters} onFilterChange={(f) => { setDecadeFilters(f); setDecadePage(1); }} />
                      </div>
                    </div>

                    <div className="decade-facts-grid">
                      {paginatedDecadeFacts.length > 0 ? (
                        paginatedDecadeFacts.map((fact, index) => (
                          <div
                            key={fact.id}
                            className="decade-fact-row-item"
                            style={{ animationDelay: `${Math.floor(index / 2) * 80}ms` }}
                          >
                            <FactCard
                              fact={fact}
                              onSave={() => handleSaveClick(fact.id)}
                              onShare={() => handleShareClick(fact)}
                              onComment={handleCommentClick}
                              onBetaClick={handleBetaClick}
                              isSaved={savedFactIds.has(fact.id)}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="decade-empty-state" data-testid="decade-empty">
                          <p>No facts found for the {selectedDecade}. Check back as we add more entries!</p>
                        </div>
                      )}
                    </div>

                    {decadeTotalPages > 1 && (
                      <Pagination
                        currentPage={clampedDecadePage}
                        totalPages={decadeTotalPages}
                        onPageChange={(p) => setDecadePage(p)}
                        scrollTargetId="__noscroll__"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="decade-sticky-category-nav" data-testid="decade-sticky-category-nav">
              <span className="decade-sticky-category-label">Filter by category:</span>
              <div className="decade-sticky-category-chips">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = decadeCategoryFilter.some(f => f.toLowerCase() === cat.name.toLowerCase());
                  return (
                    <button
                      key={cat.name}
                      className={`decade-sticky-chip${isActive ? " decade-sticky-chip-active" : ""}`}
                      style={{
                        '--chip-color': cat.color,
                        borderColor: cat.color,
                        color: isActive ? "#fff" : cat.color,
                        backgroundColor: isActive ? cat.color : "#fff",
                      } as React.CSSProperties}
                      onClick={() => setDecadeCategoryFilter(prev =>
                        isActive ? prev.filter(f => f.toLowerCase() !== cat.name.toLowerCase()) : [...prev, cat.name]
                      )}
                      data-testid={`button-decade-category-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Icon size={14} strokeWidth={2.5} style={{ color: isActive ? "#fff" : cat.color }} />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />

      <SignInModal
        isOpen={showSignIn}
        onClose={() => { setShowSignIn(false); setSignInContext(undefined); }}
        contextMessage={signInContext}
      />
      <ShareModal
        isOpen={shareModalFact !== null}
        onClose={() => setShareModalFact(null)}
        fact={shareModalFact}
      />
      <SourcesModal
        factId={sourcesModalFactId}
        onClose={() => setSourcesModalFactId(null)}
      />
      {showVerifyModal && <VerifyEmailModal onClose={() => setShowVerifyModal(false)} />}
    </div>
  );
}
