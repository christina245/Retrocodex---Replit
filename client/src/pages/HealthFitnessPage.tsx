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
import coverImage from "@assets/health_and_fitness_1764736967989.png";
import "./HealthFitnessPage.css";

import photoFoodPyramid from "@assets/stock_images/food pyramid.png";

const healthFitnessFacts: CategoryFact[] = [
  {
    id: "food-pyramid",
    myth: '"The Food Pyramid is the model for a healthy, balanced diet."',
    truth: "The Food Pyramid's hierarchy reflected the food industry's political and economic ambitions rather than scientific accuracy. In 2011, the USDA replaced it with MyPlate, which suggested more balanced portions.",
    tags: [],
    dateAdded: "2025-11-01",
    coverPhoto: photoFoodPyramid,
    betaOnly: true
  }
];

const CATEGORY_COLOR = "#F2994A";

export default function HealthFitnessPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"featured" | "recent">("featured");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<CategoryFact | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dbFacts = [] } = useQuery<Fact[]>({
    queryKey: ["/api/facts"],
  });

  const databaseHealthFacts: CategoryFact[] = useMemo(() => {
    return dbFacts
      .filter(fact => fact.categories.includes("Health & Fitness"))
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

  const allHealthFacts = useMemo(() => {
    const staticIds = new Set(healthFitnessFacts.map(f => f.id));
    const uniqueDbFacts = databaseHealthFacts.filter(f => !staticIds.has(f.id));
    return [...healthFitnessFacts, ...uniqueDbFacts];
  }, [databaseHealthFacts]);

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

  const displayedFacts = activeTab === "featured" 
    ? allHealthFacts 
    : [...allHealthFacts].sort((a, b) => {
        if (!a.dateAdded || !b.dateAdded) return 0;
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });

  return (
    <div className="health-fitness-page">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <CategoryNav selectedCategory="HEALTH & FITNESS" />

      <main className="health-fitness-main-content">
        <div className="health-fitness-intro-row">
          <div className="health-fitness-description">
            <p>
              For many people who grew up in the 80s, 90s, and 2000s, health and fitness advice came from a mix of gym folklore, glossy magazine spreads, government food charts, and diet trends promoted by brands with something to sell. Early wellness marketing often turned oversimplified ideas into universal "rules," pushing strict step counts, rigid hydration targets, and one-size-fits-all approaches to eating.
            </p>
            <p>
              Gym culture layered on its own set of misconceptions about stretching, soreness, sweating, and how the body builds or loses muscle. Many myths spread because they made intuitive sense, or because they promised quick fixes like targeted fat loss or rapid detoxing. Others grew out of misunderstood studies, conservative medical advice, or consumer trends that rewarded catchy soundbites over nuance. And because these messages were repeated by teachers, parents, trainers, and ads across the world, they became deeply ingrained — even when they were based on outdated or incomplete science.
            </p>
          </div>
          <div className="health-fitness-photo">
            <img 
              src={coverImage} 
              alt="Woman lifting weights in a gym" 
              className="health-fitness-photo-img"
            />
          </div>
        </div>

        <div className="health-fitness-content-area">
          <div className="health-fitness-tabs-row">
            <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="health-fitness-filter-container">
              <CategoryFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={setSelectedFilters} 
              />
            </div>
            <div className="health-fitness-key-container">
              <FactKey />
            </div>
          </div>

          <div className="health-fitness-content-container">
            <div className="health-fitness-facts-grid">
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

            <aside className="health-fitness-sidebar">
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
            category: "HEALTH & FITNESS",
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
