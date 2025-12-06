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
import coverImage from "@assets/life sciences_1764363998621.png";
import "./LifeSciencesPage.css";

import photoBrain from "@assets/stock_images/neon brain.png";
import photoDinosaurs from "@assets/dinosaurs (1)_1764363998621.png";
import photoBlood from "@assets/stock_images/blood cells.png";
import photoSenses from "@assets/humans 5 senses_1764363998622.png";
import photoViruses from "@assets/viruses_1764363998620.png";
import photoColds from "@assets/catching a cold_1764363998621.png";

const lifeSciencesFacts: CategoryFact[] = [
  {
    id: "brain-10-percent",
    myth: '"You only use 10% of your brain."',
    truth: "Your entire brain is used. Brain scans show activity throughout, even when sleeping or at rest. The myth likely came from early misunderstandings of neuroscience, boosted by self-help culture.",
    tags: [],
    dateAdded: "2025-10-22",
    link: "/fact/brain-10-percent",
    coverPhoto: photoBrain
  },
  {
    id: "dinosaurs-scaly",
    myth: '"Dinosaurs were all scaly reptiles."',
    truth: "Fossil evidence shows that some dinosaurs, especially those related to birds, had feathers or feather-like coverings.",
    tags: [],
    dateAdded: "2025-11-20",
    coverPhoto: photoDinosaurs,
    betaOnly: true
  },
  {
    id: "blood-blue",
    myth: '"Human blood is actually blue until it comes into contact with oxygen."',
    truth: "Deoxygenated blood is still red, just a darker shade. The myth likely have come from seeing veins appear blue through the skin, a visual effect, rather than the blood itself.",
    tags: [],
    dateAdded: "2025-11-15",
    coverPhoto: photoBlood,
    betaOnly: true
  },
  {
    id: "five-senses",
    myth: '"Humans only have 5 senses: sight, touch, taste, smell, and sound."',
    truth: "Neuroscientists believe we have up to 33 senses, such as proprioception, thermoception, kinaesthesia, and more.",
    tags: [],
    dateAdded: "2025-11-22",
    coverPhoto: photoSenses,
    betaOnly: true
  },
  {
    id: "viruses-alive",
    myth: '"Viruses, unlike bacteria, aren\'t alive."',
    truth: "It's still debated whether viruses are alive or not. Some recently discovered viruses carry genes similar to living beings.",
    tags: [],
    dateAdded: "2025-11-23",
    coverPhoto: photoViruses,
    betaOnly: true
  },
  {
    id: "colds-from-cold",
    myth: '"You catch colds from being cold."',
    truth: "Colds are caused by viruses, not temperature. During cold weather, you're more likely to be indoors where viruses spread more easily.",
    tags: [],
    dateAdded: "2025-11-24",
    coverPhoto: photoColds,
    betaOnly: true
  }
];

const CATEGORY_COLOR = "#6FCF97";

export default function LifeSciencesPage() {
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

  // Filter database facts to only include Life Sciences category and convert to CategoryFact format
  const databaseLifeSciencesFacts: CategoryFact[] = useMemo(() => {
    return dbFacts
      .filter(fact => fact.categories.includes("Life Sciences"))
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
  const allLifeSciencesFacts = useMemo(() => {
    const staticIds = new Set(lifeSciencesFacts.map(f => f.id));
    const uniqueDbFacts = databaseLifeSciencesFacts.filter(f => !staticIds.has(f.id));
    return [...lifeSciencesFacts, ...uniqueDbFacts];
  }, [databaseLifeSciencesFacts]);

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
    ? allLifeSciencesFacts 
    : [...allLifeSciencesFacts].sort((a, b) => {
        if (!a.dateAdded || !b.dateAdded) return 0;
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });

  return (
    <div className="life-sciences-page">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <CategoryNav selectedCategory="LIFE SCIENCES" />

      <main className="life-sciences-main-content">
        <div className="life-sciences-intro-row">
          <div className="life-sciences-description">
            <p>
              Life science is a fast-moving field, and many popular "facts" about biology, evolution, and human health simply haven't kept up with modern research. This page dives into some of the most widespread myths about living organisms—from dinosaurs and animals to human senses, viruses, bacteria, and plant biology—and explains what scientists have uncovered since those ideas first took hold.
            </p>
            <p>
              You'll learn why the Brontosaurus was thought to be a mistake, why human blood never actually turns blue, and how the tongue-map diagram spread despite being debunked decades ago.
            </p>
          </div>
          <div className="life-sciences-photo">
            <img 
              src={coverImage} 
              alt="Life Sciences - Panda in nature" 
              className="life-sciences-photo-img"
            />
          </div>
        </div>

        <div className="life-sciences-content-area">
          <div className="life-sciences-tabs-row">
            <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="life-sciences-filter-container">
              <CategoryFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={setSelectedFilters} 
              />
            </div>
            <div className="life-sciences-key-container">
              <FactKey />
            </div>
          </div>

          <div className="life-sciences-content-container">
            <div className="life-sciences-facts-grid">
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

            <aside className="life-sciences-sidebar">
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
            category: "LIFE SCIENCES",
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
