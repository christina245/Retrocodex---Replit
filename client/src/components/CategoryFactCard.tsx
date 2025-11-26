import { XCircle, CheckSquare, MessageSquare, Bookmark, Share2 } from "lucide-react";
import forwardArrow from "@assets/forward triangle_1763705098229.png";
import "./CategoryFactCard.css";

export interface CategoryFact {
  id: string;
  myth: string;
  truth: string;
  tags?: string[];
  link?: string;
  dateAdded?: string;
}

interface CategoryFactCardProps {
  fact: CategoryFact;
  categoryColor: string;
  onSave?: () => void;
  onShare?: () => void;
  onComment?: () => void;
}

export function CategoryFactCard({ 
  fact, 
  categoryColor,
  onSave, 
  onShare, 
  onComment 
}: CategoryFactCardProps) {
  const handleLearnMore = () => {
    if (fact.link) {
      window.location.href = fact.link;
    }
  };

  return (
    <div className="category-fact-card-wrapper">
      <div 
        className="category-fact-card"
        style={{ '--card-category-color': categoryColor } as React.CSSProperties}
      >
        <div className="category-fact-header">
          {fact.tags && fact.tags.length > 0 && (
            <div className="category-fact-tags">
              {fact.tags.map((tag, index) => (
                <span key={index} className="category-fact-tag" data-testid={`tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="category-fact-content">
          <div className="category-fact-section">
            <div className="category-fact-statement">
              <XCircle size={18} className="category-fact-icon myth-icon" />
              <p className="category-fact-text myth-text">{fact.myth}</p>
            </div>
            
            <div className="category-fact-statement">
              <CheckSquare size={18} className="category-fact-icon truth-icon" />
              <p className="category-fact-text truth-text">{fact.truth}</p>
            </div>
          </div>

          {fact.link && (
            <button 
              className="category-learn-more-button"
              onClick={handleLearnMore}
              data-testid={`button-learn-more-${fact.id}`}
            >
              <img src={forwardArrow} alt="" className="category-learn-more-arrow" />
              Learn more
            </button>
          )}
        </div>
      </div>

      <div className="category-fact-actions">
        <button 
          className="category-action-button" 
          onClick={onComment}
          data-testid={`button-comment-${fact.id}`}
        >
          <MessageSquare size={14} />
          <span>0 comments</span>
        </button>
        <button 
          className="category-action-button" 
          onClick={onSave}
          data-testid={`button-save-${fact.id}`}
        >
          <Bookmark size={14} />
          <span>Save</span>
        </button>
        <button 
          className="category-action-button" 
          onClick={onShare}
          data-testid={`button-share-${fact.id}`}
        >
          <Share2 size={14} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
