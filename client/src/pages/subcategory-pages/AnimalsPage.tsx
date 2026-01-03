import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Fact } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { SortSelector, type SortOption } from "@/components/SortSelector";
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
import "./AnimalsPage.css";

import photoDinosaurs from "@assets/dinosaurs (1)_1764363998621.png";

const animalsFacts: CategoryFact[] = [
  
];

const SUBCATEGORY_COLOR = "#2C2C2C";

export default function AnimalsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<CategoryFact | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dbFacts = [], isLoading } = useQuery<Fact[]>({
    queryKey: ["/api/facts"],
  });

  const databaseFacts: CategoryFact[] = useMemo(() => {
    return dbFacts
      .filter(fact => fact.subcategories?.includes("Animals"))
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

  const allFacts = useMemo(() => {
    const staticIds = new Set(animalsFacts.map(f => f.id));
    const uniqueDbFacts = databaseFacts.filter(f => !staticIds.has(f.id));
    return [...animalsFacts, ...uniqueDbFacts];
  }, [databaseFacts]);

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

  const sortedFacts = [...allFacts].sort((a, b) => {
    if (!a.dateAdded || !b.dateAdded) return 0;
    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
  });

  const filteredFacts = selectedFilters.length > 0
    ? sortedFacts.filter(fact => 
        fact.factFilters && fact.factFilters.some(filter => selectedFilters.some(sf => sf.toLowerCase() === filter.toLowerCase()))
      )
    : sortedFacts;

  return (
    <div className="animals-page">
      <SEO 
        title="Animals" 
        description="Discover the truth about animal behavior, biology, and ecology. Separate fact from fiction in wildlife misconceptions." 
      />
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav activeCategory="OTHER" sticky />

      <main className="animals-main-content">
        <Link 
          href="/category/other" 
          className="animals-breadcrumb"
          data-testid="link-back-other"
        >
          <ArrowLeft size={18} />
          <span>Other categories</span>
        </Link>

        <div className="animals-header-section">
          <h1 className="category-page-h1">Misconceptions About Animals</h1>
        </div>

        <div className="animals-content-area">
          <div className="animals-tabs-row">
            <div className="animals-key-container">
              <FactKey />
            </div>
            <SortSelector selectedSort={sortOption} onSortChange={setSortOption} />
            <div className="animals-filter-container">
              <CategoryFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={setSelectedFilters} 
              />
            </div>
          </div>

          <div className="animals-content-container">
            <div className="animals-facts-column">
              {isLoading ? (
                <div className="animals-loading-state" data-testid="loading-state">
                  <img 
                    src={loadingLogo} 
                    alt="" 
                    className="animals-loading-logo"
                    data-testid="img-loading-logo"
                  />
                </div>
              ) : filteredFacts.length === 0 && selectedFilters.length > 0 ? (
                <EmptyFilterState />
              ) : (
                <div className="animals-facts-grid">
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

            <aside className="animals-sidebar">
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
            category: "ANIMALS",
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
