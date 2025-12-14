import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Fact } from "@shared/schema";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { CategoryNav } from "@/components/CategoryNav";
import { TabSelector } from "@/components/TabSelector";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CategoryFactCard, type CategoryFact } from "@/components/CategoryFactCard";
import { FactKey } from "@/components/FactKey";
import { BeehiivBanner } from "@/components/BeehiivBanner";
import { SaveModal } from "@/components/SaveModal";
import { ShareModal } from "@/components/ShareModal";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { EmptyFilterState } from "@/components/EmptyFilterState";
import loadingLogo from "@assets/line_logo_white_background_1764717128944.png";
import "./FoodPage.css";

import photoFoodPyramid from "@assets/stock_images/food pyramid.png";
import photoButter from "@assets/stock_images/butter.png"

const foodFacts: CategoryFact[] = [
  {
    id: "margarine-butter",
    myth: "Margarine is healthier than butter.",
    truth: "Not if they contain a significant amount of trans fats, which many of them do — particularly in stick form.",
    factFilters: [],
    dateAdded: "2025-12-01",
    coverPhoto: photoButter,
    betaOnly: true
  },
  {
    id: "food-pyramid",
    myth: "The Food Pyramid is the model for a healthy, balanced diet.",
    truth: "The Food Pyramid's hierarchy reflected the food industry's political and economic ambitions rather than scientific accuracy. In 2011, the USDA replaced it with MyPlate, which suggested more balanced portions.",
    factFilters: [],
    dateAdded: "2025-11-01",
    coverPhoto: photoFoodPyramid,
    betaOnly: true
  }
];

const SUBCATEGORY_COLOR = "#2C2C2C";

export default function FoodPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"featured" | "recent">("featured");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<CategoryFact | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dbFacts = [], isLoading } = useQuery<Fact[]>({
    queryKey: ["/api/facts"],
  });

  const databaseFoodFacts: CategoryFact[] = useMemo(() => {
    return dbFacts
      .filter(fact => fact.subcategory === "Food")
      .map(fact => ({
        id: fact.id,
        myth: fact.mythHeader,
        truth: fact.truthHeader,
        factFilters: fact.factFilters || [],
        dateAdded: fact.createdAt ? new Date(fact.createdAt).toISOString().split('T')[0] : undefined,
        link: `/fact/${fact.slug}`,
        coverPhoto: fact.coverPhoto || undefined,
        betaOnly: true,
      }));
  }, [dbFacts]);

  const allFoodFacts = useMemo(() => {
    const staticIds = new Set(foodFacts.map(f => f.id));
    const uniqueDbFacts = databaseFoodFacts.filter(f => !staticIds.has(f.id));
    return [...foodFacts, ...uniqueDbFacts];
  }, [databaseFoodFacts]);

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
      title: "Unavailable in beta",
      description: "Only a limited amount of fact entries are available in beta mode. Check back later to view this fact's sources and discussion!",
    });
  };

  const handleBetaClick = () => {
    toast({
      title: "Unavailable in beta",
      description: "Only a limited amount of fact entries are available in beta mode. Check back later to view this fact's sources and discussion!",
    });
  };

  const sortedFacts = activeTab === "featured" 
    ? allFoodFacts 
    : [...allFoodFacts].sort((a, b) => {
        if (!a.dateAdded || !b.dateAdded) return 0;
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });

  const filteredFacts = selectedFilters.length > 0
    ? sortedFacts.filter(fact => 
        fact.factFilters && fact.factFilters.some(filter => selectedFilters.includes(filter))
      )
    : sortedFacts;

  return (
    <div className="food-page">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <CategoryNav selectedCategory="OTHER" />

      <main className="food-main-content">
        <Link 
          href="/category/other" 
          className="food-breadcrumb"
          data-testid="link-back-other"
        >
          <ArrowLeft size={18} />
          <span>Other categories</span>
        </Link>

        <div className="food-header-section">
          <p className="food-intro-text">Misconceptions about</p>
          <h1 className="food-title">Food</h1>
        </div>

        <div className="food-content-area">
          <div className="food-tabs-row">
            <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="food-filter-container">
              <CategoryFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={setSelectedFilters} 
              />
            </div>
            <div className="food-key-container">
              <FactKey />
            </div>
          </div>

          <div className="food-content-container">
            <div className="food-facts-column">
              {isLoading ? (
                <div className="food-loading-state" data-testid="loading-state">
                  <img 
                    src={loadingLogo} 
                    alt="" 
                    className="food-loading-logo"
                    data-testid="img-loading-logo"
                  />
                </div>
              ) : filteredFacts.length === 0 && selectedFilters.length > 0 ? (
                <EmptyFilterState />
              ) : (
                <div className="food-facts-grid">
                  {filteredFacts.map((fact) => (
                    <CategoryFactCard
                      key={fact.id}
                      fact={fact}
                      categoryColor={SUBCATEGORY_COLOR}
                      onSave={handleSaveClick}
                      onShare={() => handleShareClick(fact)}
                      onComment={handleCommentClick}
                      onBetaClick={handleBetaClick}
                    />
                  ))}
                </div>
              )}
            </div>

            <aside className="food-sidebar">
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
            category: "FOOD",
            categoryColor: SUBCATEGORY_COLOR,
            myth: shareModalFact.myth,
            truth: shareModalFact.truth,
            link: shareModalFact.link
          }}
        />
      )}
    </div>
  );
}
