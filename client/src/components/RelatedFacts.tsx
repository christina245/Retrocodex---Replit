import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import "./RelatedFacts.css";

import leftRightBrainImg from "@assets/left and right brain_1764566485121.png";
import intelligenceImg from "@assets/intelligence_1764566485120.png";
import fiveSensesImg from "@assets/humans 5 senses_1764363998622.png";
import learningStylesImg from "@assets/stock_images/people studying.png"

interface RelatedFact {
  id: string;
  myth: string;
  image: string;
  betaOnly?: boolean;
}

interface RelatedFactsProps {
  facts?: RelatedFact[];
}

const defaultRelatedFacts: RelatedFact[] = [
  {
    id: "left-right-brain",
    myth: 'People are either left-brained or right-brained.',
    image: leftRightBrainImg
  },
  {
    id: "learning-styles",
    myth: 'We have distinct learning styles, such as visual or auditory.',
    image: learningStylesImg
  },
  {
    id: "intelligence-brain-size",
    myth: 'Intelligence is positively correlated with brain size.',
    image: intelligenceImg
  },
  {
    id: "five-senses",
    myth: 'We only have 5 senses: touch, taste, smell, sight, and hearing.',
    image: fiveSensesImg
  }
];

export function RelatedFacts({ facts = defaultRelatedFacts }: RelatedFactsProps) {
  const { toast } = useToast();

  const handleBetaClick = () => {
    toast({
      title: "Unavailable in Beta",
      description: "This fact is still being researched and will be available soon.",
    });
  };

  return (
    <div className="related-facts" data-testid="related-facts">
      <h3 className="related-facts-header">Related myths</h3>
      <div className="related-facts-list">
        {facts.map((fact, index) => (
          <div key={fact.id} className="related-fact-wrapper">
            {fact.betaOnly ? (
              <button 
                type="button"
                className="related-fact-item related-fact-button"
                onClick={handleBetaClick}
                data-testid={`button-related-fact-${fact.id}`}
              >
                <div className="related-fact-image-container">
                  {fact.image ? (
                    <img 
                      src={fact.image} 
                      alt="" 
                      className="related-fact-image"
                    />
                  ) : (
                    <div className="related-fact-image-placeholder" />
                  )}
                </div>
                <span className="related-fact-text">"{fact.myth}"</span>
              </button>
            ) : (
              <Link 
                href={`/fact/${fact.id}`}
                className="related-fact-item"
                data-testid={`link-related-fact-${fact.id}`}
              >
                <div className="related-fact-image-container">
                  {fact.image ? (
                    <img 
                      src={fact.image} 
                      alt="" 
                      className="related-fact-image"
                    />
                  ) : (
                    <div className="related-fact-image-placeholder" />
                  )}
                </div>
                <span className="related-fact-text">"{fact.myth}"</span>
              </Link>
            )}
            {index < facts.length - 1 && (
              <div className="related-fact-separator" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RelatedFacts;
