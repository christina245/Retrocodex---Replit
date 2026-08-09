import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Pencil, BellRing, Bell, BellOff, X } from "lucide-react";
import envelopeImage from "@assets/email_1774815930235.png";
import { SingleFactHeaderDark as SingleFactHeader } from "@/components/SingleFactHeaderDark";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { CommentsSection } from "@/components/CommentsSection";
import { Poll } from "@/components/Poll";
import { SignInModal } from "@/components/SignInModal";
import { RelatedFacts } from "@/components/RelatedFacts";
import squirrelImg from "@assets/scrungy/scrungy at work cotton.png";
import { FactTags } from "@/components/FactTags";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { FAQSchema } from "@/components/FAQSchema";
import { CategoryLinks } from "@/components/CategoryLinks";
import ExtendedFactCard from "@/components/ExtendedFactCard";
import TimelineSection from "@/components/TimelineSection";
import type { Fact as FactType } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { useSavedFacts } from "@/lib/useSavedFacts";
import { useVerificationGuard } from "@/lib/useVerificationGuard";
import { VerifyEmailModal } from "@/components/VerifyEmailModal";
import "./SingleFactPage.css";

export default function SingleFactPage() {
  const { id } = useParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [showSubscribeTooltip, setShowSubscribeTooltip] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInContext, setSignInContext] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isLoggedIn, user } = useAuth();
  const { savedFactIds, toggleSave } = useSavedFacts(isLoggedIn);
  const { showVerifyModal, setShowVerifyModal, requireVerified } = useVerificationGuard();

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

  const relatedMythIds = factData?.relatedMythIds || [];
  
  const { data: relatedFactsData } = useQuery<FactType[]>({
    queryKey: ["/api/facts/by-ids", relatedMythIds],
    queryFn: async () => {
      if (relatedMythIds.length === 0) return [];
      const response = await fetch(`/api/facts/by-ids?ids=${relatedMythIds.join(',')}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: relatedMythIds.length > 0,
  });

  const relatedFacts = relatedFactsData?.map(f => ({
    id: f.slug, // Use slug for linking since RelatedFacts links to /fact/${id}
    myth: f.mythHeader,
    image: f.coverPhoto || "",
    betaOnly: f.betaOnly || false
  })) || [];

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
    if (!isLoggedIn) {
      setSignInContext("Sign in to save this fact to your collection.");
      setShowSignIn(true);
      return;
    }
    if (factData?.id) {
      requireVerified(() => toggleSave(factData!.id));
    }
  };

  const { data: followStatusData } = useQuery<{ following: boolean }>({
    queryKey: ["/api/facts", factData?.id, "follow-status"],
    queryFn: async () => {
      const res = await fetch(`/api/facts/${factData!.id}/follow-status`);
      if (!res.ok) throw new Error("Failed to fetch follow status");
      return res.json();
    },
    enabled: !!factData?.id && isLoggedIn,
  });

  const isFollowing = followStatusData?.following ?? false;

  const isBeta = factData?.betaOnly ?? false;

  const followMutation = useMutation({
    mutationFn: async () => {
      const method = isFollowing ? "DELETE" : "POST";
      return await apiRequest(method, `/api/facts/${factData!.id}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facts", factData?.id, "follow-status"] });
      if (!isFollowing) {
        toast({
          title: "Following this topic",
          description: isBeta
            ? "You'll be notified when this topic's full details are ready."
            : "You'll be notified when this topic is updated.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFollowClick = () => {
    if (!isLoggedIn) {
      setSignInContext(
        isBeta
          ? "Sign in to follow this topic and get notified when its full details are ready."
          : "Sign in to follow this topic and get notified when it's updated."
      );
      setShowSignIn(true);
      return;
    }
    if (!isFollowing) {
      setIsFollowModalOpen(true);
    } else {
      followMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="single-fact-page">
        <SEO title="Loading..." description="Loading fact on Retrocodex." noIndex={true} />
        <SingleFactHeader onMenuClick={() => setIsMenuOpen(true)} />
        <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <div className="loading-state" data-testid="loading-state">
          <img 
            src="/loading-bar.gif" 
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
    details: factData.mythDetails ?? "",
    moreDetails: factData.truthDetails ?? undefined,
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
                className={`subscribe-button${isFollowing ? " subscribe-button--following" : ""}`}
                onClick={handleFollowClick}
                data-testid="button-subscribe"
                aria-label={isFollowing ? "Unfollow this topic" : "Follow this topic"}
                disabled={followMutation.isPending}
              >
                {isFollowing ? (
                  <>
                    <Bell className="subscribe-icon" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <BellRing className="subscribe-icon" />
                    <span>Follow</span>
                  </>
                )}
              </button>
              {showSubscribeTooltip && (
                <div className="subscribe-tooltip" data-testid="tooltip-subscribe">
                  {isFollowing
                    ? "Stop receiving updates for this topic."
                    : isBeta
                      ? "Get notified when this topic's full details are ready."
                      : "Stay updated if this information evolves."}
                </div>
              )}
            </div>
            <div className="edit-date-cell">
              <span
                className="suggest-edit-link"
                data-testid="link-suggest-edit"
              >
                <Pencil className="suggest-edit-icon" />
                <span className="suggest-edit-text">Suggest an edit</span>
                <span className="suggest-edit-tooltip">Unavailable in beta</span>
              </span>
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
              isSaved={factData ? savedFactIds.has(factData.id) : false}
            />
          </div>

          <div className="right-column">
            {isBeta ? (
              <div className="beta-right-column-placeholder">
                <img
                  src={squirrelImg}
                  alt="Scrungy the squirrel working on this entry"
                  className="beta-placeholder-img"
                  data-testid="img-beta-placeholder"
                />
                <p className="beta-placeholder-text">
                  This topic's details are currently unavailable in the beta. 
                  <br /><br />
                  <p>⬆️ Click the "Follow" button above to be notified when Scrungy the squirrel has finished working on it.</p>
                  <br /><br />
                  <p>⬅️ At the moment, you can <b>view this topic's sources </b> on the left. </p>
                  
                </p>
              
              </div>
            ) : (
              <TimelineSection 
                timeline={factData.timeline || []} 
                nuances={factData.nuances || []}
              />
            )}
          </div>
        </div>

        <div className="below-content-grid">
          <div className="comments-column">
            <CommentsSection
              factId={factData?.id ?? ""}
              onLoginClick={(msg) => { setSignInContext(msg); setShowSignIn(true); }}
            />
          </div>
          <div className="sidebar-column">
            <Poll 
              question="Were you taught this information?"
              options={[
                "Yes, in school",
                "Yes, outside of school",
                "Yes, unsure where",
                "No",
                "Not sure",
                "I was taught a different version",
                "I was taught the presently accurate version",
                "Other"
              ]}
              factId={factData?.id ?? ""}
              onLoginClick={(msg) => { setSignInContext(msg); setShowSignIn(true); }}
              onVerifyClick={() => setShowVerifyModal(true)}
            />
            <div className="sidebar-bottom-section">
              <div className="sidebar-top-row">
                {relatedFacts.length > 0 && (
                  <RelatedFacts facts={relatedFacts} />
                )}
                <div className="tags-banner-column">
                  <CategoryLinks categories={factData.categories} />
                  <FactTags tags={factData.searchTags || []} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isFollowModalOpen && (
        <div className="follow-fact-modal-overlay" data-testid="follow-fact-modal" onClick={() => setIsFollowModalOpen(false)}>
          <div className="follow-fact-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="follow-fact-modal-close"
              onClick={() => setIsFollowModalOpen(false)}
              data-testid="button-close-follow-modal"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <img src={envelopeImage} alt="" className="follow-fact-modal-image" />
            <h2 className="follow-fact-modal-title">Follow this topic</h2>
            <p className="follow-fact-modal-body">
              {isBeta
                ? <>You'll receive an email to <strong>{user?.email ?? "your email"}</strong> when this topic's full details are ready.</>
                : <>You'll receive an email to <strong>{user?.email ?? "your email"}</strong> whenever this topic is updated or evolves.</>
              }
            </p>
            <div className="follow-fact-modal-actions">
              <button
                className="follow-fact-modal-confirm"
                data-testid="button-confirm-follow"
                onClick={() => {
                  followMutation.mutate();
                  setIsFollowModalOpen(false);
                }}
                disabled={followMutation.isPending}
              >
                <Bell size={15} />
                Follow Topic
              </button>
              <button
                className="follow-fact-modal-cancel"
                data-testid="button-cancel-follow"
                onClick={() => setIsFollowModalOpen(false)}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <SignInModal
        isOpen={showSignIn}
        onClose={() => { setShowSignIn(false); setSignInContext(undefined); }}
        contextMessage={signInContext}
      />
      {showVerifyModal && <VerifyEmailModal onClose={() => setShowVerifyModal(false)} />}
    </div>
  );
}
