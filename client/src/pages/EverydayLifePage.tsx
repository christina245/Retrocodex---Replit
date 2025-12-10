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
import coverImage from "@assets/everyday life_1764573292477.png";
import "./EverydayLifePage.css";

import photoGum from "@assets/chewing gum_1764576659258.png";
import photoSpiders from "@assets/stock_images/plastic spiders.png";
import photoHyperKids from "@assets/stock_images/hyper kids.png";
import photoColds from "@assets/catching a cold_1764363998621.png";

const everydayLifeFacts: CategoryFact[] = [
  {
    id: "gum-seven-years",
    myth: "If you swallow gum, it\'ll stay in your stomach for seven years.",
    truth: "Gum won't stay inside your body if swallowed. However, it can't be digested like other foods, so it passes through waste intact rather than broken down.",
    factFilters: [],
    dateAdded: "2025-11-25",
    link: "/fact/gum-seven-years",
    coverPhoto: photoGum,
    betaOnly: true
  },
  {
    id: "swallow-spiders",
    myth: "Humans swallow an average of 8 spiders in their sleep every year.",
    truth: "You're unlikely to swallow even one. Your breathing while asleep tends to scare spiders away, not to mention spiders generally avoid humans and our mouths.",
    factFilters: [],
    dateAdded: "2025-11-18",
    link: "/fact/swallow-spiders",
    coverPhoto: photoSpiders,
    betaOnly: true
  },
  {
    id: "sugar-hyper",
    myth: "Eating too much sugar makes kids hyper.",
    truth: "There isn't a direct causal link between sugar and hyperactivity. Sugary foods are more likely to be present during exciting activities like birthday parties, creating an illusory correlation.",
    factFilters: [],
    dateAdded: "2025-11-05",
    link: "/fact/sugar-hyper",
    coverPhoto: photoHyperKids,
    betaOnly: true
  },
  {
    id: "colds-from-cold",
    myth: "You catch colds from being cold.",
    truth: "Colds are caused by viruses, not temperature. During cold weather, you're more likely to be indoors where viruses spread more easily.",
    factFilters: ["Partially true"],
    dateAdded: "2025-11-24",
    link: "/fact/colds-from-cold",
    coverPhoto: photoColds,
    betaOnly: true
  }
];

const CATEGORY_COLOR = "#2A9BEC";

export default function EverydayLifePage() {
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

  // Filter database facts to only include Everyday Life category and convert to CategoryFact format
  const databaseEverydayLifeFacts: CategoryFact[] = useMemo(() => {
    return dbFacts
      .filter(fact => fact.categories.includes("Everyday Life"))
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
  const allEverydayLifeFacts = useMemo(() => {
    const staticIds = new Set(everydayLifeFacts.map(f => f.id));
    const uniqueDbFacts = databaseEverydayLifeFacts.filter(f => !staticIds.has(f.id));
    return [...everydayLifeFacts, ...uniqueDbFacts];
  }, [databaseEverydayLifeFacts]);

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

  const displayedFacts = activeTab === "featured" 
    ? allEverydayLifeFacts 
    : [...allEverydayLifeFacts].sort((a, b) => {
        if (!a.dateAdded || !b.dateAdded) return 0;
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });

  return (
    <div className="everyday-life-page">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <CategoryNav selectedCategory="EVERYDAY LIFE" />

      <main className="everyday-life-main-content">
        <div className="everyday-life-intro-row">
          <div className="everyday-life-description">
            <p>
              Everyday life is full of little "facts" we absorb without ever checking where they came from. Family sayings, schoolyard rumors, well-meaning advice from adults, and catchy lines from old advertisements often blend together into a kind of informal rulebook for living. Claims such as "breakfast is the most important meal of the day" may not be true, but they persist because they're memorable, comforting, or framed as simple rules for staying healthy, polite, or responsible.
            </p>
            <p>
              Many of these myths didn't originate as deliberate falsehoods, but as misunderstandings, exaggerations, or outdated beliefs passed through generations. Everyday myths reveal how information spreads in the absence of formal teaching: not through textbooks or experts, but through habits, culture, and repetition. This collection explores the roots, evidence, and cultural history behind these familiar claims.
            </p>
          </div>
          <div className="everyday-life-photo">
            <img 
              src={coverImage} 
              alt="Everyday Life - Couple at holiday market" 
              className="everyday-life-photo-img"
            />
          </div>
        </div>

        <div className="everyday-life-content-area">
          <div className="everyday-life-tabs-row">
            <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="everyday-life-filter-container">
              <CategoryFilter 
                selectedFilters={selectedFilters} 
                onFilterChange={setSelectedFilters} 
              />
            </div>
            <div className="everyday-life-key-container">
              <FactKey />
            </div>
          </div>

          <div className="everyday-life-content-container">
            <div className="everyday-life-facts-grid">
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

            <aside className="everyday-life-sidebar">
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
            category: "EVERYDAY LIFE",
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
