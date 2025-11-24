import { useState } from "react";
import { useParams } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SingleFactHeader } from "@/components/SingleFactHeader";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { SaveModal } from "@/components/SaveModal";
import { ShareModal } from "@/components/ShareModal";
import { Footer } from "@/components/Footer";
import CategoryChips from "@/components/CategoryChips";
import ExtendedFactCard from "@/components/ExtendedFactCard";
import TimelineSection from "@/components/TimelineSection";
import type { Fact } from "@/components/FactCard";
import "./SingleFactPage.css";

export default function SingleFactPage() {
  const { id } = useParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareModalFact, setShareModalFact] = useState<Fact | null>(null);
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

  const handleShareClick = () => {
    const factForShare: Fact = {
      id: factData.id,
      category: factData.category[0] || "OTHER",
      categoryColor: "#6FCF97",
      myth: factData.myth,
      truth: factData.truth,
      link: `/fact/${factData.id}`,
    };
    setShareModalFact(factForShare);
  };

  const factData = {
    id: "brain-10-percent",
    myth: '"You only use 10% of your brain."',
    truth: "You use nearly all of your brain at any given time.",
    category: ["Life Sciences", "Social Sciences"],
    details: "Brain imaging shows that nearly all regions are active at different times, even during simple tasks and while sleeping. The myth likely came from misinterpretations of neuroscience research and has been popularized by movies and self-help claims.",
    moreDetails: "People often lose noticeable abilities with damage to just small portions of the brain, which is inconsistent with it being 90% unused. It is possible that this myth may be a misinterpretation of the fact that some parts of the brain may be less active than others.",
    sources: [
      {
        type: "editorial",
        name: "McGovern Institute",
        logo: "mcgovern svg",
        url: "https://mcgovern.mit.edu"
      },
      {
        type: "editorial",
        name: "Association for Psychological Science",
        logo: "Association_for_Psychological_Science_Logo_-_PNG 1",
        url: "https://www.psychologicalscience.org"
      },
      {
        type: "academic",
        name: 'S. Anum et al., “Evolution of the Human Brain and the Myth of its Ten-Percent Use,” None, Sep. 2024, doi: 10.30884/seh/2024.02.02.',
        url: "https://www.sociostudies.org/upload/socionauki.ru/journal/seh/2024_2/002_Anum.pdf"
      }
    ],
    timeline: [
      {
        year: "1907",
        text: "Psychologist William James suggested that people utilize only a fraction of their mental capacity. However, James referred to psychological capability and mental potential in terms of habit, motivation, and conscious utilization of existing faculties, rather than a literal percentage of brain tissue humans employ."
      },
      {
        year: "1936",
        text: 'The myth becomes commercially popularized through its adoption and promotion by self-help authors and motivational speakers throughout the twentieth century. The self-help book How to Win Friends and Influence People by Dale Carnegie is released in 1936 with a foreword by broadcaster Lowell Thomas, who wrote "Professor William James of Harvard used to say that the average man develops only ten per cent of his latent mental ability."'
      },
      {
        year: "1999",
        text: 'Psychology professor Barry Beyerstein, who had been publishing influential neuroscience critiques of brain myths and pseudoscience since 1985, publishes "Whence Cometh the Myth that We Only Use 10% of our Brains?”'
      }
    ],
    photos: [
      { 
        src: "how to win friends 1936 version 1",
        hasTransparentBg: false
      },
      { 
        src: "limitless cover",
        hasTransparentBg: false
      },
      { 
        src: "Lucy - Quad Movie Poster (Crop)",
        hasTransparentBg: true
      }
    ],
    addedDate: "Nov. 23, 2025",
    updatedDate: null
  };

  return (
    <div className="single-fact-page">
      <SingleFactHeader onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      <div className="page-content">
        <div className="category-row">
          <CategoryChips categories={factData.category} />
          <div className="date-label">
            {factData.updatedDate 
              ? `Last updated ${factData.updatedDate}` 
              : `Added on ${factData.addedDate}`
            }
          </div>
        </div>

        <div className="content-grid">
          <div className="left-column">
            <ExtendedFactCard 
              fact={factData}
              onSave={handleSaveClick}
              onShare={handleShareClick}
            />
          </div>

          <div className="right-column">
            <TimelineSection 
              timeline={factData.timeline} 
              photos={factData.photos}
            />
          </div>
        </div>
      </div>

      <SaveModal 
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSubmit={handleEmailSubmit}
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
