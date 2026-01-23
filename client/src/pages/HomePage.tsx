import { useState, useMemo, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { HomepageTabs, type HomepageTabType } from "@/components/HomepageTabs";
import { FactCard, type Fact } from "@/components/FactCard";
import { FactKey } from "@/components/FactKey";
import { BeehiivBanner } from "@/components/BeehiivBanner";
import { SaveModal } from "@/components/SaveModal";
import { ShareModal } from "@/components/ShareModal";
import { Footer } from "@/components/Footer";
import { Pagination } from "@/components/Pagination";
import { SEO } from "@/components/SEO";
import type { Fact as DbFact } from "@shared/schema";
import "./HomePage.css";

const FACTS_PER_PAGE = 10;
const MAX_RECENT_FACTS = 30;

import photo1Columbus from "@assets/stock_images/christopher columbus.png";
import photo2Brain from "@assets/stock_images/neon brain.png";
import photo3FoodPyramid from "@assets/stock_images/food pyramid.png";
import photo4HyperKids from "@assets/stock_images/hyper kids.png";
import photo5Learning from "@assets/stock_images/people studying.png";
import photo6Gender from "@assets/stock_images/men vs women.png";
import photo7Spelling from "@assets/stock_images/spelling bee.png";
import photo8Blood from "@assets/stock_images/blood cells.png";
import photo9Spiders from "@assets/stock_images/plastic spiders.png";
import photo10Marie from "@assets/stock_images/marie antoinette.png";

const allFacts: Fact[] = [
  {
    id: "1",
    category: "HISTORY",
    categoryColor: "#D29E00",
    myth: "Christopher Columbus discovered the Americas.",
    truth: "Columbus only reached Central and South America. He never actually reached North America. At the time, Indigenous peoples had already been living in throughout the Americas for thousands of years.",
    dateAdded: "2025-10-15",
    coverPhoto: photo1Columbus,
    betaOnly: true
  },
  {
    id: "2",
    category: "LIFE SCIENCES",
    categoryColor: "#419F36",
    myth: "You only use 10% of your brain.",
    truth: "Your entire brain is used. Brain scans show activity throughout, even when sleeping or at rest. The myth likely came from early misunderstandings of neuroscience, boosted by self-help culture.",
    dateAdded: "2025-10-22",
    link: "/fact/brain-10-percent",
    coverPhoto: photo2Brain
  },
  {
    id: "3",
    category: "HEALTH & FITNESS",
    categoryColor: "#EC7200",
    myth: "The Food Pyramid is the model for a healthy, balanced diet.",
    truth: "The Food Pyramid's hierarchy reflected the food industry's political and economic interests rather than scientific accuracy. In 2011, the USDA replaced it with MyPlate, which suggested more balanced portions.",
    dateAdded: "2025-11-01",
    coverPhoto: photo3FoodPyramid,
    link: "fact/what-was-wrong-with-the-food-pyramid",
    factFilters: ["Official Revision"]
  },
  {
    id: "4",
    category: "EVERYDAY LIFE",
    categoryColor: "#0167A2",
    myth: "Eating too much sugar makes kids hyper.",
    truth: "There isn't a direct causal link between sugar and hyperactivity. Sugary foods are more likely to be present during exciting activities like birthday parties, creating an illusory correlation.",
    dateAdded: "2025-11-05",
    link: "fact/does-eating-sugar-make-kids-hyper",
    coverPhoto: photo4HyperKids
    
  },
  {
    id: "5",
    category: "SOCIAL SCIENCES",
    categoryColor: "#9D0085",
    myth: "People have different learning styles, such as being a visual or auditory learner.",
    truth: "Learning styles are typically based on self-reported preferences rather than scientific evidence. They generally do not influence overall learning outcomes.",
    dateAdded: "2025-11-08",
    coverPhoto: photo5Learning,
    betaOnly: true
  },
  {
    id: "6",
    category: "GENDER & SEXUALITY",
    categoryColor: "#FF6F98",
    myth: "Men and women have very different brains.",
    truth: "While there are some differences on average, there is more functional overlap than not, and more variation within each sex than between the two sexes.",
    dateAdded: "2025-11-21",
    coverPhoto: photo6Gender,
    betaOnly: true
  },
  {
    id: "7",
    category: "OTHER • LINGUISTICS",
    categoryColor: "#2C2C2C",
    myth: "A general spelling rule is I before E except after C.",
    truth: "The English language has several words where this generalization does not apply: science, height, their, protein, caffeine, vein, beige, neighbor, weird, seize, and many others.",
    dateAdded: "2025-11-12",
    coverPhoto: photo7Spelling,
    betaOnly: true
  },
  {
    id: "8",
    category: "LIFE SCIENCES",
    categoryColor: "#419F36",
    myth: "Human blood is actually blue until it comes into contact with oxygen.",
    truth: "Deoxygenated blood is still red, just a darker shade. Veins appear blue because blue light penetrates skin more efficiently than the rest of the visible light spectrum and is more easily absorbed.",
    dateAdded: "2025-11-15",
    link: "fact/is-human-blood-blue",
    coverPhoto: photo8Blood
  },
  {
    id: "9",
    category: "EVERYDAY LIFE",
    categoryColor: "#0167A2",
    myth: "Humans swallow an average of 8 spiders in their sleep every year.",
    truth: "You're unlikely to swallow even one. Your breathing while asleep tends to scare spiders away. This myth may have been purposely spread as a social experiment.",
    dateAdded: "2025-11-18",
    link: "fact/do-you-swallow-spiders-in-your-sleep",
    coverPhoto: photo9Spiders
  },
  {
    id: "10",
    category: "HISTORY",
    categoryColor: "#D29E00",
    myth: "Marie Antoinette said 'Let them eat cake' regarding the French working class.",
    truth: "This line was actually written by author Jean-Jacques Rousseau and attributed to an unnamed princess. It may have been misattributed to her as political propaganda.",
    dateAdded: "2025-11-20",
    link: "fact/marie-antoinette-let-them-eat-cake",
    coverPhoto: photo10Marie
  
  }
];

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
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<Fact | null>(null);
  const [recentPage, setRecentPage] = useState(1);
  const [popularPage, setPopularPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dbFacts = [] } = useQuery<DbFact[]>({
    queryKey: ["/api/facts"],
  });

  const { data: popularDbFacts = [] } = useQuery<DbFact[]>({
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
      };
    });
  }, [popularDbFacts]);

  const popularTotalPages = Math.max(1, Math.ceil(popularFacts.length / FACTS_PER_PAGE));
  const clampedPopularPage = Math.min(popularPage, popularTotalPages);
  const paginatedPopularFacts = popularFacts.slice(
    (clampedPopularPage - 1) * FACTS_PER_PAGE,
    clampedPopularPage * FACTS_PER_PAGE
  );

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

  const handleSaveClick = () => {
    setIsSaveModalOpen(true);
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

  const handleBetaClick = () => {
    toast({
      title: "Unavailable in beta",
      description: "At this time, only the Featured facts on the homepage have published entries. Subscribe to be notified when all entries are available!",
    });
  };

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
        };
      });
  }, [dbFacts]);

  const getDisplayedFacts = (): Fact[] => {
    switch (activeTab) {
      case "explore":
        return allFacts;
      case "new":
        return paginatedRecentFacts;
      case "popular":
        return paginatedPopularFacts;
      case "regionally-taught":
        return regionallyTaughtFacts;
      case "trending":
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
  const emptyStateMessage = (activeTab === "trending" || activeTab === "debated") 
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
          What were you taught <br /> that's been <u>disproven</u>?
        </h1>
        <p className="homepage-tagline" data-testid="text-homepage-tagline">
          Explore sources and timelines tracing how each myth emerged from misunderstood evidence.
        </p>

        <HomepageCategoryNav />
        <HomepageTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="content-area" id="content-area">
          {activeTab === "regionally-taught" && (
            <p className="tab-subheader" data-testid="text-regionally-taught-subheader">
              Regionally Taught explores beliefs and narratives passed down in specific countries, states, regions, <br /> or communities shaped by local history and culture.
            </p>
          )}
          {activeTab === "popular" && (
            <p className="tab-subheader" data-testid="text-popular-subheader">
              Popular features misconceptions frequently reported by social media users on{" "}
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
          {activeTab === "trending" && (
            <p className="tab-subheader" data-testid="text-trending-subheader">
              Trending explores misinformation relevant to upcoming holidays or current events.
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
                      onSave={handleSaveClick}
                      onShare={() => handleShareClick(fact)}
                      onComment={handleCommentClick}
                      onBetaClick={handleBetaClick}
                    />
                  ))
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
      <ShareModal
        isOpen={shareModalFact !== null}
        onClose={() => setShareModalFact(null)}
        fact={shareModalFact}
      />
    </div>
  );
}
