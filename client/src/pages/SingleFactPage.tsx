import { useState, useEffect } from "react";
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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
    details: "Brain imaging shows that nearly all regions are active at different times, even during simple tasks and while sleeping.",
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
        text: 'The myth becomes commercially popularized through its adoption and promotion by self-help authors and motivational speakers throughout the twentieth century. The self-help book <i><a href="https://en.wikipedia.org/wiki/How_to_Win_Friends_and_Influence_People" target="_blank">How to Win Friends and Influence People</a></i> by Dale Carnegie is released in 1936 with a foreword by broadcaster Lowell Thomas, who wrote "Professor William James of Harvard used to say that the average man develops only ten per cent of his latent mental ability."'
      },
      {
        year: "1999",
        text: 'The book <i>Mind Myths</i> is released with a section by psychology professor Barry Beyerstein called "Whence Cometh the Myth that We Only Use 10% of our Brains?”'
      },
      {
        year: "2002",
        text: ' The OECD identifies the myth as one of several “neuromyths” commonly perpetuated by educators.'
      },
      {
        year: "2011",
        text: 'The film <i>Limitless</i> is released: the film depicts the protagonist’s evolution after he takes a nootropic drug that claims to give him full use of his brain as opposed to “only 20%”.'
      },
      {
        year: "2014",
        text: 'The film <i>Lucy</i> is released with a similar premise as Limitless, where the protagonist also takes a drug that allows her to use "100% of her brain."'
      },
      {
        year: "2017",
        text: "Psychologists find that 56% of educators still perpetuate neuromyths. These results were also consistent with a similar 2012 study conducted in the UK and the Netherlands."
      },
      {
        year: "2024",
        text: 'A comprehensive review emphasizes that advanced neuroimaging techniques, such as PET scans and functional magnetic resonance imaging (fMRI), unequivocally demonstrate that virtually all parts of the brain are interconnected and functionally active, even during periods of rest or sleep. The authors of the 2024 review point out that retaining 90% of a metabolically expensive organ like the brain if it were truly unused would be scientifically improbable: "If the parts of the brain are unnecessary and unused, then they must be removed or disappear, according to the rule of the theory of evolution".'
      },
      {
        year: "2025",
        text: 'Articles debunking this myth are still being published in recent years, such as “The 10-Percent-of-Your-Brain Myth That Just Won’t Die” in 2021 from Discover Magazine, “Do we only use 10 percent of our brain?” by MIT in 2024, and “Beyond the Myth That We Use Only 10 Percent of Our Brains” from Psychology Today in 2025. This suggests the myth is still commonly circulating, although it isn’t specified where it’s being taught.'
      }
    ],
    photos: [
      { 
        src: "how to win friends 1936 version 1",
        hasTransparentBg: false,
        caption: "1936 edition of How to Win Friends and Influence People"
      },
      { 
        src: "limitless cover",
        hasTransparentBg: false,
        caption: "Limitless (2011) movie poster"
      },
      { 
        src: "Lucy - Quad Movie Poster (Crop)",
        hasTransparentBg: false,
        caption: "Lucy (2014) movie poster"
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
