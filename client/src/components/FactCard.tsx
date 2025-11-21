import { MessageCircle, Bookmark, Share2, X, Check } from "lucide-react";
import "./FactCard.css";

export interface Fact {
  id: string;
  category: string;
  categoryColor: string;
  myth: string;
  truth: string;
}

interface FactCardProps {
  fact: Fact;
  onSave: () => void;
  onShare: () => void;
  onComment: () => void;
}

export function FactCard({ fact, onSave, onShare, onComment }: FactCardProps) {
  const truthTextSize = fact.truth.length > 180 ? "truth-text-long" : "truth-text-short";
  
  return (
    <div className="fact-card-wrapper">
      <div 
        className="fact-card"
        data-testid={`card-fact-${fact.id}`}
      >
        {/* Category Header */}
        <div 
          className="fact-category"
          style={{ backgroundColor: `${fact.categoryColor}0D` }}
        >
          <span className="category-badge">{fact.category}</span>
        </div>

        {/* Content */}
        <div className="fact-content">
          {/* Myth */}
          <div className="fact-section">
            <div className="fact-statement myth">
              <X className="fact-icon myth-icon" />
              <p className="fact-text myth-text">"{fact.myth}"</p>
            </div>
          </div>

          {/* Truth */}
          <div className="fact-section">
            <div className="fact-statement truth">
              <Check className="fact-icon truth-icon" />
              <p className={`fact-text truth-text ${truthTextSize}`}>{fact.truth}</p>
            </div>
          </div>

          {/* Learn More Button */}
          <button 
            className="learn-more-button"
            data-testid={`button-learn-more-${fact.id}`}
          >
            Learn more
          </button>
        </div>
      </div>

      {/* Social Actions */}
      <div className="fact-actions">
        <button 
          className="action-button"
          onClick={onComment}
          data-testid={`button-comment-${fact.id}`}
        >
          <MessageCircle size={16} />
          <span>0 comments</span>
        </button>
        <button 
          className="action-button"
          onClick={onSave}
          data-testid={`button-save-${fact.id}`}
        >
          <Bookmark size={16} />
          <span>Save</span>
        </button>
        <button 
          className="action-button"
          onClick={onShare}
          data-testid={`button-share-${fact.id}`}
        >
          <Share2 size={16} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
