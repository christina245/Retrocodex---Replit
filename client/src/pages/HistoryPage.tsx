import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Fact } from "@shared/schema";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { CategoryNav } from "@/components/CategoryNav";
import { TabSelector } from "@/components/TabSelector";
import { CategoryFactCard, type CategoryFact } from "@/components/CategoryFactCard";
import { FactKey } from "@/components/FactKey";
import { BeehiivBanner } from "@/components/BeehiivBanner";
import { SaveModal } from "@/components/SaveModal";
import { ShareModal } from "@/components/ShareModal";
import { Footer } from "@/components/Footer";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Pagination } from "@/components/Pagination";
import { EmptyFilterState } from "@/components/EmptyFilterState";
import coliseumImage from "@assets/stock_images/history cover photo.png";
import "./HistoryPage.css";

const FACTS_PER_PAGE = 10;

import photoColumbus from "@assets/stock_images/christopher columbus.png";
import photoVikings from "@assets/stock_images/vikings.png";
import photoPlymouth from "@assets/stock_images/pilgrims.png";
import photoThanksgiving from "@assets/stock_images/the first thanksgiving.png";
import photoMarie from "@assets/stock_images/marie antoinette.png";
import photoPilgrim from "@assets/stock_images/pilgrims with buckles.png";

const historyFacts: CategoryFact[] = [
  {
    id: "columbus",
    myth: '"Christopher Columbus discovered North America in 1492."',
    truth: "Columbus only reached Central and South America where several indigenous tribes had already established distinctive civilizations.",
    factFilters: [],
    dateAdded: "2025-10-15",
    coverPhoto: photoColumbus,
    betaOnly: true
  },
  {
    id: "vikings-helmets",
    myth: '"Vikings usually wore horned helmets."',
    truth: "Archaeological evidence has yet to find a horned helmet originating in the Viking era. The horned helmets found originate in the Bronze Age, 2000 years before Vikings.",
    factFilters: [],
    dateAdded: "2025-11-20",
    coverPhoto: photoVikings,
    betaOnly: true
  },
  {
    id: "plymouth-rock",
    myth: '"The Pilgrims initially landed at Plymouth Rock in 1620."',
    truth: "There are no records of where they landed exactly.",
    factFilters: [],
    dateAdded: "2025-11-25",
    coverPhoto: photoPlymouth,
    betaOnly: true
  },
  {
    id: "thanksgiving-turkey",
    myth: '"Turkey was served at the First Thanksgiving meal in 1621."',
    truth: "The only bird on record was just 'fowl'. Turkeys were abundant at the time, so it was possible but not guaranteed. The association between turkey and Thanksgiving was actually popularized by a writer in the 19th century.",
    factFilters: [],
    dateAdded: "2025-11-26",
    coverPhoto: photoThanksgiving,
    betaOnly: true
  },
  {
    id: "marie-antoinette",
    myth: '"Marie Antoinette ignorantly said \'Let them eat cake\' regarding the French Revolution."',
    truth: "This line was actually written by author Jean-Jacques Rousseau and attributed to an unnamed princess years before Marie Antoinette. It may have been misattributed to her as political propaganda.",
    factFilters: [],
    dateAdded: "2025-11-24",
    coverPhoto: photoMarie,
    betaOnly: true
  },
  {
    id: "pilgrim-clothing",
    myth: '"The Pilgrims usually wore black clothes with big buckles."',
    truth: "They wore colorful clothing in everyday life. The black outfits they're typically depicted with were for formal, rarer occasions.",
    factFilters: [],
    dateAdded: "2025-11-27",
    coverPhoto: photoPilgrim,
    betaOnly: true
  }
];

const CATEGORY_COLOR = "#F5D547";

export default function HistoryPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"featured" | "recent">("featured");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<CategoryFact | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const handleSaveClick = () => {
    setIsSaveModalOpen(true);
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

  const handleBetaClick = () => {
    toast({
      title: "Unavailable in beta",
      description: "Only a limited amount of fact entries are available in beta mode. Check back later to view this fact's sources and discussion!",
    });
  };

  // Sort facts based on active tab
  const sortedFacts = activeTab === "featured" 
    ? allHistoryFacts 
    : [...allHistoryFacts].sort((a, b) => {
        if (!a.dateAdded || !b.dateAdded) return 0;
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });

  // Apply filters
  const filteredFacts = selectedFilters.length > 0
    ? sortedFacts.filter(fact => 
        fact.factFilters && fact.factFilters.some(filter => selectedFilters.includes(filter))
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

  const handleTabChange = (tab: "featured" | "recent") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="history-page">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <CategoryNav selectedCategory="HISTORY" />

      <main className="history-main-content">
        <div className="history-intro-row">
          <div className="history-description">
            <p><b>Your school history lessons might have left out certain critical perspectives. </b></p>
            <p>
              What we know about history is always evolving as new archaelogical records surface, modern analytical tools reinterpret old texts, and previously overlooked, marginalized voices finally become heard.
            </p>
            <p>
             The media further exacerbated historical inaccuracies with its exaggerated or inaccurate portrayals of several societies. Throughout the world, the same events may be taught differently through culturally biased lenses serving regional interests rather than the full picture. When those perspectives collide with current scholarship, the story becomes more complex, yet more accurate.

            </p>
          </div>
          <div className="history-photo">
            <img 
              src={coliseumImage} 
              alt="The Coliseum in Rome" 
              className="history-photo-img"
            />
          </div>
        </div>

        <div className="history-content-area">
          <div className="history-tabs-row">
            <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="history-filter-container">
              <CategoryFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={handleFilterChange} 
              />
            </div>
            <div className="history-key-container">
              <FactKey />
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
                        onSave={handleSaveClick}
                        onShare={() => handleShareClick(fact)}
                        onComment={handleCommentClick}
                        onBetaClick={handleBetaClick}
                      />
                    ))}
                  </div>
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
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
    </div>
  );
}
