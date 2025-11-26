import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
import coliseumImage from "@assets/coliseum_1764195549967.jpg";
import "./HistoryPage.css";

const historyFacts: CategoryFact[] = [
  {
    id: "columbus",
    myth: '"Christopher Columbus discovered North America in 1492."',
    truth: "Columbus only reached Central and South America where several indigenous tribes had already established distinctive civilizations.",
    tags: [],
    dateAdded: "2025-10-15"
  },
  {
    id: "vikings-helmets",
    myth: '"Vikings usually wore horned helmets."',
    truth: "Archaeological evidence has yet to find a horned helmet originating in the Viking era. The horned helmets found originate in the Bronze Age, 2000 years before Vikings.",
    tags: [],
    dateAdded: "2025-11-20"
  }
];

const CATEGORY_COLOR = "#F5D547";

export default function HistoryPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"featured" | "recent">("featured");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<CategoryFact | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const displayedFacts = activeTab === "featured" 
    ? historyFacts 
    : [...historyFacts].sort((a, b) => {
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
          <div className="history-content-container">
            <div className="history-main-column">
              <div className="history-facts-section">
                <div className="history-tabs-and-key-container">
                  <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
                  <FactKey />
                </div>
                <div className="history-facts-grid">
                  {displayedFacts.map((fact) => (
                    <CategoryFactCard
                      key={fact.id}
                      fact={fact}
                      categoryColor={CATEGORY_COLOR}
                      onSave={handleSaveClick}
                      onShare={() => handleShareClick(fact)}
                      onComment={handleCommentClick}
                    />
                  ))}
                </div>
              </div>
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
