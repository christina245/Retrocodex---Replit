import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Fact } from "@shared/schema";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { CategoryNav } from "@/components/CategoryNav";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CategoryFactCard, type CategoryFact } from "@/components/CategoryFactCard";
import { FactKey } from "@/components/FactKey";
import { SaveModal } from "@/components/SaveModal";
import { ShareModal } from "@/components/ShareModal";
import { Footer } from "@/components/Footer";
import { Search } from "lucide-react";
import { EmptyFilterState } from "@/components/EmptyFilterState";
import "./SearchResultsPage.css";

import photoAnimals from "@assets/animals_1764816085493.png";
import photoAstronomy from "@assets/astronomy_1764816085492.png";
import photoBeauty from "@assets/beauty_1764816085492.png";
import photoEarthScience from "@assets/earth_science_1764816085491.png";
import photoFood from "@assets/food_1764816085491.png";
import photoLinguistics from "@assets/linguistics_1764816085490.png";
import photoMusic from "@assets/music_1764816085490.png";
import photoPhysics from "@assets/physics_1764816085489.png";
import photoTechnology from "@assets/tech_1764816085490.png";
import photoUncategorized from "@assets/uncategorized_1764816085488.png";

interface SearchResult {
  facts: Fact[];
  matchingSubcategories: string[];
  tagOnlyFacts: Fact[];
}

interface SearchFact extends CategoryFact {
  matchType: 'text' | 'tag';
}

const SUBCATEGORY_SLUGS: Record<string, string> = {
  "Animals": "animals",
  "Astronomy": "astronomy",
  "Beauty": "beauty",
  "Earth Science": "earth-science",
  "Technology": "technology",
  "Food": "food",
  "Linguistics": "linguistics",
  "Music": "music",
  "Physics": "physics",
  "Uncategorized": "uncategorized",
};

const SUBCATEGORY_DATA: Record<string, { description: string; photo: string }> = {
  "Animals": { 
    description: "Some animals may be safer or more dangerous than you think.",
    photo: photoAnimals
  },
  "Astronomy": { 
    description: "Mistaken ideas about space, planets, stars, and how our understanding of the universe continues to evolve.",
    photo: photoAstronomy
  },
  "Beauty": { 
    description: "Several ingredients you were told to avoid in beauty products might not deserve that stigma.",
    photo: photoBeauty
  },
  "Earth Science": { 
    description: "Addressing common errors about weather, climate, geology, oceans, and the forces that shape our planet.",
    photo: photoEarthScience
  },
  "Technology": { 
    description: "What is today's technology actually capable of? Is AI actually on par with human abilities?",
    photo: photoTechnology
  },
  "Food": { 
    description: "Years of deceptive marketing have given us the wrong ideas of what foods and nutrients are actually healthy.",
    photo: photoFood
  },
  "Linguistics": { 
    description: "You've probably been pronouncing some words wrong for years.",
    photo: photoLinguistics
  },
  "Music": { 
    description: "Revealing mistaken beliefs about music history, genres, theory, production, and how humans perceive and create sound.",
    photo: photoMusic
  },
  "Physics": { 
    description: "Untangling oversimplified or outdated ideas about motion, energy, forces, matter, and the nature of the physical world.",
    photo: photoPhysics
  },
  "Uncategorized": { 
    description: "A mix of widespread misconceptions that don't fit neatly elsewhere but expose how everyday assumptions can mislead us.",
    photo: photoUncategorized
  },
};

function highlightText(text: string, query: string): JSX.Element {
  if (!query.trim()) return <>{text}</>;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <span key={index} className="search-highlight">{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function SearchResultsPage() {
  const { query: searchQuery } = useParams<{ query: string }>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<CategoryFact | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const decodedQuery = searchQuery ? decodeURIComponent(searchQuery) : '';

  const { data: searchResults, isLoading } = useQuery<SearchResult>({
    queryKey: ["/api/search", searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(decodedQuery)}`);
      if (!response.ok) throw new Error("Failed to search");
      return response.json();
    },
    enabled: !!searchQuery,
  });

  const allFacts: SearchFact[] = useMemo(() => {
    if (!searchResults) return [];
    
    const textFacts: SearchFact[] = searchResults.facts.map(fact => ({
      id: fact.id,
      myth: fact.mythHeader,
      truth: fact.truthHeader,
      factFilters: fact.factFilters || [],
      dateAdded: fact.createdAt ? new Date(fact.createdAt).toISOString().split('T')[0] : undefined,
      link: `/fact/${fact.slug}`,
      coverPhoto: fact.coverPhoto || undefined,
      betaOnly: false,
      matchType: 'text' as const,
    }));

    const tagFacts: SearchFact[] = searchResults.tagOnlyFacts.map(fact => ({
      id: fact.id,
      myth: fact.mythHeader,
      truth: fact.truthHeader,
      factFilters: fact.factFilters || [],
      dateAdded: fact.createdAt ? new Date(fact.createdAt).toISOString().split('T')[0] : undefined,
      link: `/fact/${fact.slug}`,
      coverPhoto: fact.coverPhoto || undefined,
      betaOnly: false,
      matchType: 'tag' as const,
    }));

    return [...textFacts, ...tagFacts];
  }, [searchResults]);

  const filteredFacts = selectedFilters.length > 0
    ? allFacts.filter(fact => 
        fact.factFilters && fact.factFilters.some(filter => selectedFilters.includes(filter))
      )
    : allFacts;

  const matchingSubcategories = searchResults?.matchingSubcategories || [];

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

  const hasResults = matchingSubcategories.length > 0 || allFacts.length > 0;

  return (
    <div className="search-results-page">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <CategoryNav />

      <div className="search-results-layout">
        <main className="search-results-main-content">
        {matchingSubcategories.length > 0 && (
          <section className="search-results-section">
            <div className="search-results-header-row">
              <div className="search-results-header-left">
                <Search size={20} className="search-results-icon" />
                <span className="search-results-intro-text">Category results for</span>
                <span className="search-results-query">"{decodedQuery}"</span>
              </div>
            </div>

            <div className="search-results-subcategories-grid">
              {matchingSubcategories.map((subcategory) => {
                const data = SUBCATEGORY_DATA[subcategory];
                const slug = SUBCATEGORY_SLUGS[subcategory];
                return (
                  <div 
                    key={subcategory} 
                    className="search-subcategory-card"
                    data-testid={`card-subcategory-${slug}`}
                  >
                    <Link 
                      href={`/category/other/${slug}`}
                      className="search-subcategory-photo-link"
                      data-testid={`link-subcategory-photo-${slug}`}
                    >
                      <img 
                        src={data?.photo} 
                        alt={subcategory} 
                        className="search-subcategory-photo"
                      />
                    </Link>
                    <div className="search-subcategory-content">
                      <Link 
                        href={`/category/other/${slug}`}
                        className="search-subcategory-name"
                        data-testid={`link-subcategory-name-${slug}`}
                      >
                        {subcategory.toUpperCase()}
                      </Link>
                      <p className="search-subcategory-description">
                        {data?.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {allFacts.length > 0 && (
          <section className="search-results-section">
            <div className="search-results-header-row">
              <div className="search-results-header-left">
                <Search size={20} className="search-results-icon" />
                <span className="search-results-intro-text">Fact results for</span>
                <span className="search-results-query">"{decodedQuery}"</span>
              </div>
            </div>

            <div className="search-results-key-filter-row">
              <div className="search-results-key-left">
                <FactKey />
              </div>
              <div className="search-results-key-right">
                <CategoryFilter 
                  selectedFilters={selectedFilters} 
                  onFilterChange={setSelectedFilters} 
                />
              </div>
            </div>

            <div className="search-results-facts-grid">
              {filteredFacts.length === 0 && selectedFilters.length > 0 ? (
                <EmptyFilterState />
              ) : (
                <>
                  {filteredFacts.map((fact) => (
                    <CategoryFactCard
                      key={fact.id}
                      fact={fact}
                      categoryColor="#2C2C2C"
                      onSave={handleSaveClick}
                      onShare={() => handleShareClick(fact)}
                      onComment={handleCommentClick}
                      onBetaClick={handleBetaClick}
                      highlightQuery={fact.matchType === 'text' ? decodedQuery : undefined}
                    />
                  ))}
                </>
              )}
            </div>
          </section>
        )}

        {!isLoading && !hasResults && (
          <div className="search-results-empty">
            <Search size={48} className="search-results-empty-icon" />
            <h2 className="search-results-empty-title">No results found</h2>
            <p className="search-results-empty-text">
              We couldn't find any facts or categories matching "{decodedQuery}". 
              Try a different search term.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="search-results-loading">
            <p>Searching...</p>
          </div>
        )}
      </main>
      </div>

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
