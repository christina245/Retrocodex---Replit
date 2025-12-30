import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Pencil, BellRing } from "lucide-react";
import loadingLogo from "@assets/line_logo_white_background_1764717128944.png";
import { SingleFactHeader } from "@/components/SingleFactHeader";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { SaveModal } from "@/components/SaveModal";
import { ShareModal } from "@/components/ShareModal";
import { SubscribeModal } from "@/components/SubscribeModal";
import { CommentsSection } from "@/components/CommentsSection";
import { Poll } from "@/components/Poll";
import { RelatedFacts } from "@/components/RelatedFacts";
import { BeehiivBanner } from "@/components/BeehiivBanner";
import { FactTags } from "@/components/FactTags";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { FAQSchema } from "@/components/FAQSchema";
import { CategoryLinks } from "@/components/CategoryLinks";
import ExtendedFactCard from "@/components/ExtendedFactCard";
import TimelineSection from "@/components/TimelineSection";
import type { Fact } from "@/components/FactCard";
import type { Fact as FactType } from "@shared/schema";
import "./SingleFactPage.css";

export default function SingleFactPage() {
  const { id } = useParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<Fact | null>(null);
  const [showSubscribeTooltip, setShowSubscribeTooltip] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const { data: factData, isLoading, error } = useQuery<FactType>({
    queryKey: ["/api/facts", id],
    queryFn: async () => {
      const response = await fetch(`/api/facts/${id}`);
      if (!response.ok) {
        throw new Error("Fact not found");
      }
      return response.json();
    },
    enabled: !!id,
  });

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

  const handleSubscribeClick = () => {
    setIsSubscribeModalOpen(true);
  };

  const handleShareClick = () => {
    if (!factData) return;
    const factForShare: Fact = {
      id: factData.id,
      category: factData.categories[0] || "OTHER",
      categoryColor: "#6FCF97",
      myth: factData.mythHeader,
      truth: factData.truthHeader,
      link: `/fact/${factData.slug}`,
    };
    setShareModalFact(factForShare);
  };

  if (isLoading) {
    return (
      <div className="single-fact-page">
        <SEO title="Loading..." description="Loading fact on Retrocodex." noIndex={true} />
        <SingleFactHeader onMenuClick={() => setIsMenuOpen(true)} />
        <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <div className="loading-state" data-testid="loading-state">
          <img 
            src={loadingLogo} 
            alt="" 
            className="loading-logo"
            data-testid="img-loading-logo"
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !factData) {
    return (
      <div className="single-fact-page">
        <SEO title="Fact Not Found" description="The fact you're looking for doesn't exist or has been removed." noIndex={true} />
        <SingleFactHeader onMenuClick={() => setIsMenuOpen(true)} />
        <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <div className="error-container" data-testid="error-state">
          <h2>Fact not found</h2>
          <p>The fact you're looking for doesn't exist or has been removed.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedDate = factData.createdAt 
    ? new Date(factData.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    : null;

  const extendedFactData = {
    id: factData.id,
    myth: factData.mythHeader,
    truth: factData.truthHeader,
    category: factData.categories,
    details: factData.mythDetails,
    moreDetails: factData.truthDetails,
    sources: factData.sources || [],
  };

  return (
    <div className="single-fact-page">
      <SEO 
        title={factData.title || factData.mythHeader}
        description={`Myth: ${factData.mythHeader}. Truth: ${factData.truthHeader}`}
        image={factData.coverPhoto || undefined}
      />
      <FAQSchema 
        question={factData.title || factData.mythHeader}
        answer={factData.truthHeader}
      />
      <SingleFactHeader onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      <div className="page-content">
        <div className="title-row">
          <h1 className="fact-page-title" data-testid="text-fact-title">{factData.title}</h1>
          <div className="right-info">
            <div 
              className="subscribe-button-container"
              onMouseEnter={() => setShowSubscribeTooltip(true)}
              onMouseLeave={() => setShowSubscribeTooltip(false)}
            >
              <button 
                className="subscribe-button"
                onClick={handleSubscribeClick}
                data-testid="button-subscribe"
                aria-label="Subscribe to fact updates"
              >
                <BellRing className="subscribe-icon" />
                <span>Follow</span>
              </button>
              {showSubscribeTooltip && (
                <div className="subscribe-tooltip" data-testid="tooltip-subscribe">
                  Stay updated if this information evolves.
                </div>
              )}
            </div>
            <div className="edit-date-cell">
              <a 
                href="https://form.typeform.com/to/x2EOj8Ex" 
                target="_blank" 
                rel="noopener noreferrer"
                className="suggest-edit-link"
                data-testid="link-suggest-edit"
              >
                <Pencil className="suggest-edit-icon" />
                <span className="suggest-edit-text">Suggest an edit</span>
              </a>
              <div className="date-label">
                {formattedDate ? `Added on ${formattedDate}` : ''}
              </div>
            </div>
          </div>
        </div>

        <div className="content-grid">
          <div className="left-column">
            <ExtendedFactCard 
              fact={extendedFactData}
              onSave={handleSaveClick}
              onShare={handleShareClick}
            />
          </div>

          <div className="right-column">
            <TimelineSection 
              timeline={factData.timeline || []} 
              nuances={factData.nuances || []}
            />
          </div>
        </div>

        <div className="below-content-grid">
          <div className="comments-column">
            <CommentsSection />
          </div>
          <div className="sidebar-column">
            <Poll 
              question="Were you taught this information?"
              options={[
                "Yes",
                "No",
                "Not sure",
                "Other",
                "Yes, but after graduating high school",
                "Yes, outside of school",
                "I was taught the presently accurate version"
              ]}
            />
            <div className="sidebar-bottom-section">
              <div className="sidebar-top-row">
                <RelatedFacts />
                <div className="tags-banner-column">
                  <CategoryLinks categories={factData.categories} />
                  <FactTags tags={factData.searchTags || []} />
                  <div className="email-banner-wrapper">
                    <BeehiivBanner />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SaveModal 
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSubmit={(email) => handleEmailSubmit(email, "save-modal")}
      />

      <SubscribeModal 
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        onSubmit={(email) => handleEmailSubmit(email, "subscribe-modal")}
      />
      
      {shareModalFact && (
        <ShareModal 
          isOpen={!!shareModalFact}
          onClose={() => setShareModalFact(null)}
          fact={shareModalFact}
        />
      )}

      <Footer />
    </div>
  );
}
