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
    truth: "The Food Pyramid's hierarchy reflected the food industry's political and economic ambitions rather than scientific accuracy. In 2011, the USDA replaced it with MyPlate, which suggested more balanced portions.",
    dateAdded: "2025-11-01",
    coverPhoto: photo3FoodPyramid,
    betaOnly: true
  },
  {
    id: "4",
    category: "EVERYDAY LIFE",
    categoryColor: "#0167A2",
    myth: "Too much sugar makes kids hyper.",
    truth: "There isn't a direct causal link between sugar and hyperactivity. Sugary foods are more likely to be present during exciting activities like birthday parties, creating an illusory correlation.",
    dateAdded: "2025-11-05",
    coverPhoto: photo4HyperKids,
    betaOnly: true
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
    truth: "Men's and women's brains are far more similar than different. Traits such as spatial skills, verbal ability, or emotional processing fall on overlapping spectrums.",
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
    coverPhoto: photo8Blood,
    betaOnly: true
  },
  {
    id: "9",
    category: "EVERYDAY LIFE",
    categoryColor: "#0167A2",
    myth: "Humans swallow an average of 8 spiders in their sleep every year.",
    truth: "You're unlikely to swallow even one. Your breathing while asleep tends to scare spiders away. This myth may have been purposely spread as a social experiment.",
    dateAdded: "2025-11-18",
    coverPhoto: photo9Spiders,
    betaOnly: true
  },
  {
    id: "10",
    category: "HISTORY",
    categoryColor: "#D29E00",
    myth: "Marie Antoinette said 'Let them eat cake' regarding the French working class.",
    truth: "This line was actually written by author Jean-Jacques Rousseau and attributed to an unnamed princess. It may have been misattributed to her as political propaganda.",
    dateAdded: "2025-11-20",
    coverPhoto: photo10Marie,
    betaOnly: true
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dbFacts = [] } = useQuery<DbFact[]>({
    queryKey: ["/api/facts"],
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
        const categoryDisplay = (primaryCategory === "Other" && fact.subcategory)
          ? `OTHER • ${fact.subcategory.toUpperCase()}`
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
        };
      });
  }, [dbFacts]);

  const recentTotalPages = Math.max(1, Math.ceil(recentDbFacts.length / FACTS_PER_PAGE));
  const clampedRecentPage = Math.min(recentPage, recentTotalPages);
  const paginatedRecentFacts = recentDbFacts.slice(
    (clampedRecentPage - 1) * FACTS_PER_PAGE,
    clampedRecentPage * FACTS_PER_PAGE
  );

  const handleTabChange = (tab: HomepageTabType) => {
    setActiveTab(tab);
    setRecentPage(1);
  };

  const handleRecentPageChange = (page: number) => {
    setRecentPage(Math.min(page, recentTotalPages));
  };

  useEffect(() => {
    if (recentPage > recentTotalPages) {
      setRecentPage(Math.max(1, recentTotalPages));
    }
  }, [recentTotalPages, recentPage]);

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
      description: "Only a limited amount of fact entries are available in beta mode. Check back later to view this fact's sources and discussion!",
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
        const categoryDisplay = (primaryCategory === "Other" && fact.subcategory)
          ? `OTHER • ${fact.subcategory.toUpperCase()}`
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
        };
      });
  }, [dbFacts]);

  const trendingFacts: Fact[] = useMemo(() => {
    return dbFacts
      .filter(fact => fact.isTrending)
      .map(fact => {
        const primaryCategory = fact.categories[0] || "Other";
        const categoryDisplay = (primaryCategory === "Other" && fact.subcategory)
          ? `OTHER • ${fact.subcategory.toUpperCase()}`
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
        };
      });
  }, [dbFacts]);

  const debatedFacts: Fact[] = useMemo(() => {
    return dbFacts
      .filter(fact => fact.isDebated)
      .map(fact => {
        const primaryCategory = fact.categories[0] || "Other";
        const categoryDisplay = (primaryCategory === "Other" && fact.subcategory)
          ? `OTHER • ${fact.subcategory.toUpperCase()}`
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
        };
      });
  }, [dbFacts]);

  const getDisplayedFacts = (): Fact[] => {
    switch (activeTab) {
      case "explore":
        return allFacts;
      case "new":
        return paginatedRecentFacts;
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

  const showPagination = activeTab === "new" && recentTotalPages > 1;
  const showEmptyState = displayedFacts.length === 0;
  const emptyStateMessage = (activeTab === "trending" || activeTab === "debated") 
    ? "No facts have been added, check back later!"
    : (activeTab === "regionally-taught")
      ? "No regionally taught facts available yet. Check back soon!"
      : "No facts available yet. Check back soon!";

  return (
    <div className="page-wrapper">
      <Header onMenuClick={() => setIsMenuOpen(true)} hideTagline />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <main className="main-content">
        <h1 className="homepage-headline" data-testid="text-homepage-headline">
          Unlearn myths and <br /> outdated lessons in
        </h1>

        <HomepageCategoryNav />
        <HomepageTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="content-area" id="content-area">
          {activeTab === "regionally-taught" && (
            <p className="tab-subheader" data-testid="text-regionally-taught-subheader">
              Regionally Taught explores beliefs and narratives passed down in specific countries, states, regions, <br /> or communities shaped by local history and culture.
            </p>
          )}
          {activeTab === "trending" && (
            <p className="tab-subheader" data-testid="text-trending-subheader">
              Trending explores misinformation relevant to upcoming holidays or current events.
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
              {showPagination && (
                <Pagination
                  currentPage={clampedRecentPage}
                  totalPages={recentTotalPages}
                  onPageChange={handleRecentPageChange}
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
