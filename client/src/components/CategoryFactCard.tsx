import { X, Check, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { Link } from "wouter";
import forwardArrow from "@assets/forward triangle red.png";
import placeholderPhoto from "@assets/stock_images/ancient_history_colo_d71bf0e6.jpg";
import "./CategoryFactCard.css";

export interface CategoryFact {
  id: string;
  myth: string;
  truth: string;
  tags?: string[];
  link?: string;
  dateAdded?: string;
  coverPhoto?: string;
  betaOnly?: boolean;
}

interface CategoryFactCardProps {
  fact: CategoryFact;
  categoryColor: string;
  onSave?: () => void;
  onShare?: () => void;
  onComment?: () => void;
  onBetaClick?: () => void;
}

export function CategoryFactCard({ 
  fact, 
  categoryColor,
  onSave, 
  onShare, 
  onComment,
  onBetaClick
}: CategoryFactCardProps) {
  const factLink = fact.link || `/fact/${fact.id}`;
  const photoSrc = fact.coverPhoto || placeholderPhoto;

  const handleBetaLinkClick = (e: React.MouseEvent) => {
    if (fact.betaOnly) {
      e.preventDefault();
      if (onBetaClick) {
        onBetaClick();
      }
    }
  };

  return (
    <div className="category-fact-card-wrapper">
      <div className="category-fact-card-row">
        <div 
          className="category-fact-card"
          style={{ '--card-category-color': categoryColor } as React.CSSProperties}
          data-testid={`card-fact-${fact.id}`}
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

          <div className="category-fact-body">
            <div className="category-fact-content">
              <div className="category-fact-section">
                <div className="category-fact-statement">
                  <X className="category-fact-icon myth-icon" />
                  <p className="category-fact-text myth-text">"{fact.myth}"</p>
                </div>
                
                <div className="category-fact-statement">
                  <Check className="category-fact-icon truth-icon" />
                  <p className="category-fact-text truth-text">{fact.truth}</p>
                </div>
              </div>
            </div>

            <div className="category-fact-photo">
              <img 
                src={photoSrc} 
                alt="" 
                className="category-fact-photo-img"
                data-testid={`photo-fact-${fact.id}`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="category-fact-footer">
        <div className="category-fact-actions">
          <Link 
            href={factLink}
            className="category-action-button"
            data-testid={`button-comment-${fact.id}`}
            onClick={handleBetaLinkClick}
          >
            <MessageCircle size={16} />
            <span>0 comments</span>
          </Link>
          <button 
            className="category-action-button" 
            onClick={onSave}
            data-testid={`button-save-${fact.id}`}
          >
            <Bookmark size={16} />
            <span>Save</span>
          </button>
          <button 
            className="category-action-button" 
            onClick={onShare}
            data-testid={`button-share-${fact.id}`}
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>

        <Link 
          href={factLink}
          className="category-learn-more-button"
          data-testid={`button-learn-more-${fact.id}`}
          onClick={handleBetaLinkClick}
        >
          <img src={forwardArrow} alt="" className="category-learn-more-arrow" />
          Learn more
        </Link>
      </div>
    </div>
  );
}
