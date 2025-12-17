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
import { BeehiivBanner } from "@/components/BeehiivBanner";
import { SaveModal } from "@/components/SaveModal";
import { ShareModal } from "@/components/ShareModal";
import { Footer } from "@/components/Footer";
import { Search, ChevronRight } from "lucide-react";
import { EmptyFilterState } from "@/components/EmptyFilterState";
import "./SearchResultsPage.css";

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

const SUBCATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Animals": "Misconceptions about the creatures we share the world with",
  "Astronomy": "Misconceptions about the cosmos and space exploration",
  "Beauty": "Misconceptions about beauty standards and practices",
  "Earth Science": "Misconceptions about our planet and natural phenomena",
  "Technology": "Misconceptions about the digital world and innovations",
  "Food": "Misconceptions about what we eat and nutrition",
  "Linguistics": "Misconceptions about language and communication",
  "Music": "Misconceptions about music, instruments, and artists",
  "Physics": "Misconceptions about the fundamental laws of nature",
  "Uncategorized": "Miscellaneous misconceptions that defy categorization",
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

  const hasResults = matchingSubcategories.length > 0 || filteredFacts.length > 0;

  return (
    <div className="search-results-page">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <CategoryNav />

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
              {matchingSubcategories.map((subcategory) => (
                <Link 
                  key={subcategory} 
                  href={`/category/other/${SUBCATEGORY_SLUGS[subcategory]}`}
                  className="search-subcategory-card"
                  data-testid={`link-subcategory-${SUBCATEGORY_SLUGS[subcategory]}`}
                >
                  <div className="search-subcategory-card-content">
                    <h3 className="search-subcategory-title">{subcategory}</h3>
                    <p className="search-subcategory-description">
                      {SUBCATEGORY_DESCRIPTIONS[subcategory]}
                    </p>
                  </div>
                  <ChevronRight size={24} className="search-subcategory-arrow" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {filteredFacts.length > 0 && (
          <section className="search-results-section">
            <div className="search-results-header-row">
              <div className="search-results-header-left">
                <Search size={20} className="search-results-icon" />
                <span className="search-results-intro-text">Fact results for</span>
                <span className="search-results-query">"{decodedQuery}"</span>
              </div>
              <div className="search-results-filter-container">
                <CategoryFilter 
                  selectedFilters={selectedFilters} 
                  onFilterChange={setSelectedFilters} 
                />
              </div>
            </div>

            <div className="search-results-key-container">
              <FactKey />
            </div>

            <div className="search-results-content-container">
              <div className="search-results-facts-column">
                {filteredFacts.length === 0 && selectedFilters.length > 0 ? (
                  <EmptyFilterState />
                ) : (
                  <div className="search-results-facts-grid">
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
                  </div>
                )}
              </div>

              <aside className="search-results-sidebar">
                <BeehiivBanner />
              </aside>
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
