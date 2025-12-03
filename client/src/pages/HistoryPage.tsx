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
import { EmailSignupBanner } from "@/components/EmailSignupBanner";
import { SaveModal } from "@/components/SaveModal";
import { ShareModal } from "@/components/ShareModal";
import { Footer } from "@/components/Footer";
import { CategoryFilter } from "@/components/CategoryFilter";
import coliseumImage from "@assets/stock_images/history cover photo.png";
import "./HistoryPage.css";

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
    tags: [],
    dateAdded: "2025-10-15",
    coverPhoto: photoColumbus
  },
  {
    id: "vikings-helmets",
    myth: '"Vikings usually wore horned helmets."',
    truth: "Archaeological evidence has yet to find a horned helmet originating in the Viking era. The horned helmets found originate in the Bronze Age, 2000 years before Vikings.",
    tags: [],
    dateAdded: "2025-11-20",
    coverPhoto: photoVikings
  },
  {
    id: "plymouth-rock",
    myth: '"The Pilgrims initially landed at Plymouth Rock in 1620."',
    truth: "There are no records of where they landed exactly.",
    tags: [],
    dateAdded: "2025-11-25",
    coverPhoto: photoPlymouth
  },
  {
    id: "thanksgiving-turkey",
    myth: '"Turkey was served at the First Thanksgiving meal in 1621."',
    truth: "The only bird on record was just 'fowl'. Turkeys were abundant at the time, so it was possible but not guaranteed. The association between turkey and Thanksgiving was actually popularized by a writer in the 19th century.",
    tags: [],
    dateAdded: "2025-11-26",
    coverPhoto: photoThanksgiving
  },
  {
    id: "marie-antoinette",
    myth: '"Marie Antoinette ignorantly said \'Let them eat cake\' regarding the French Revolution."',
    truth: "This line was actually written by author Jean-Jacques Rousseau and attributed to an unnamed princess years before Marie Antoinette. It may have been misattributed to her as political propaganda.",
    tags: [],
    dateAdded: "2025-11-24",
    coverPhoto: photoMarie
  },
  {
    id: "pilgrim-clothing",
    myth: '"The Pilgrims usually wore black clothes with big buckles."',
    truth: "They wore colorful clothing in everyday life. The black outfits they're typically depicted with were for formal, rarer occasions.",
    tags: [],
    dateAdded: "2025-11-27",
    coverPhoto: photoPilgrim
  }
];

const CATEGORY_COLOR = "#F5D547";

export default function HistoryPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"featured" | "recent">("featured");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<CategoryFact | null>(null);
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
        tags: fact.tags || [],
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
      title: "Under Development",
      description: "Individual fact pages are still under development. Check back soon!",
    });
  };

  const displayedFacts = activeTab === "featured" 
    ? allHistoryFacts 
    : [...allHistoryFacts].sort((a, b) => {
        if (!a.dateAdded || !b.dateAdded) return 0;
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });

  return (
    <div className="history-page">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <CategoryNav selectedCategory="HISTORY" />

      <main className="history-main-content">
        <div className="history-intro-row">
          <div className="history-description">
            <p>
              Some historical facts are totally false, misunderstood, or just outdated. 
              Historical knowledge is always changing as new evidence emerges, new methods 
              of analysis develop, and previously overlooked voices finally become heard.
            </p>
            <p>
              History lessons vary by region and culture. You may have been taught the same 
              historical events from a different perspective compared to folks from other 
              parts of the world, adding even more nuance to what we know now.
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
            <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="history-filter-container">
              <CategoryFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={setSelectedFilters} 
              />
            </div>
            <div className="history-key-container">
              <FactKey />
            </div>
          </div>

          <div className="history-content-container">
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

            <aside className="history-sidebar">
              <EmailSignupBanner 
                onSubmit={(email) => handleEmailSubmit(email, "history-page")} 
              />
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
