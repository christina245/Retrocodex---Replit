import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Fact } from "@shared/schema";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CategoryFactCard, type CategoryFact } from "@/components/CategoryFactCard";
import { FactKey } from "@/components/FactKey";
import { SaveModal } from "@/components/SaveModal";
import { ShareModal } from "@/components/ShareModal";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Tag } from "lucide-react";
import { EmptyFilterState } from "@/components/EmptyFilterState";
import "./FactsByTagPage.css";

export default function FactsByTagPage() {
  const { tagSlug } = useParams<{ tagSlug: string }>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<CategoryFact | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tagName = tagSlug ? tagSlug.replace(/-/g, ' ') : '';

  const { data: dbFacts = [], isLoading } = useQuery<Fact[]>({
    queryKey: ["/api/facts/by-tag", tagSlug],
    queryFn: async () => {
      const response = await fetch(`/api/facts/by-tag/${tagSlug}`);
      if (!response.ok) throw new Error("Failed to fetch facts");
      return response.json();
    },
    enabled: !!tagSlug,
  });

  const categoryFacts: CategoryFact[] = useMemo(() => {
    return dbFacts.map(fact => ({
      id: fact.id,
      myth: fact.mythHeader,
      truth: fact.truthHeader,
      factFilters: fact.factFilters || [],
      dateAdded: fact.createdAt ? new Date(fact.createdAt).toISOString().split('T')[0] : undefined,
      link: `/fact/${fact.slug}`,
      coverPhoto: fact.coverPhoto || undefined,
      betaOnly: false,
    }));
  }, [dbFacts]);

  const filteredFacts = selectedFilters.length > 0
    ? categoryFacts.filter(fact => 
        fact.factFilters && fact.factFilters.some(filter => selectedFilters.some(sf => sf.toLowerCase() === filter.toLowerCase()))
      )
    : categoryFacts;

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

  return (
    <div className="facts-by-tag-page">
      {tagName && (
        <SEO 
          title={`Tag: ${tagName}`}
          description={`Explore facts tagged with "${tagName}" on Retrocodex. Discover misconceptions and learn the truth.`}
          noIndex={true}
        />
      )}
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav sticky />

      <main className="facts-by-tag-main-content">
        <div className="facts-by-tag-header-row">
          <div className="facts-by-tag-header-left">
            <Tag size={20} className="facts-by-tag-icon" />
            <span className="facts-by-tag-intro-text">Misconceptions about</span>
            <span className="facts-by-tag-chip">{tagName}</span>
          </div>
          <div className="facts-by-tag-filter-container">
            <CategoryFilter 
              selectedFilters={selectedFilters} 
              onFilterChange={setSelectedFilters} 
            />
          </div>
        </div>

        <div className="facts-by-tag-key-container">
          <FactKey />
        </div>

        <div className="facts-by-tag-content-container">
          <div className="facts-by-tag-facts-column">
            {filteredFacts.length === 0 && selectedFilters.length > 0 ? (
              <EmptyFilterState />
            ) : (
              <div className="facts-by-tag-facts-grid">
                {isLoading ? (
                  <p className="facts-by-tag-loading">Loading facts...</p>
                ) : filteredFacts.length === 0 ? (
                  <p className="facts-by-tag-empty">No facts found with this tag.</p>
                ) : (
                  filteredFacts.map((fact) => (
                    <CategoryFactCard
                      key={fact.id}
                      fact={fact}
                      categoryColor="#2C2C2C"
                      onSave={handleSaveClick}
                      onShare={() => handleShareClick(fact)}
                      onComment={handleCommentClick}
                      onBetaClick={handleBetaClick}
                    />
                  ))
                )}
              </div>
            )}
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
            category: "FACTS",
            categoryColor: "#2C2C2C",
            myth: shareModalFact.myth,
            truth: shareModalFact.truth,
            link: shareModalFact.link
          }}
        />
      )}
    </div>
  );
}
