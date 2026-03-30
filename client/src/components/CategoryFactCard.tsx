import { X, Check, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { Link } from "wouter";
import forwardArrow from "@assets/forward triangle red.png";
import placeholderPhoto from "@assets/stock_images/ancient_history_colo_d71bf0e6.jpg";
import "./CategoryFactCard.css";

export interface CategoryFact {
  id: string;
  myth: string;
  truth: string;
  factFilters?: string[];
  link?: string;
  dateAdded?: string;
  coverPhoto?: string;
  betaOnly?: boolean;
  revisionYear?: number;
  taughtUntilYear?: string;
}

interface CategoryFactCardProps {
  fact: CategoryFact;
  categoryColor: string;
  onSave?: () => void;
  onShare?: () => void;
  onComment?: () => void;
  onBetaClick?: (factId: string) => void;
  highlightQuery?: string;
  isSaved?: boolean;
}

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function highlightText(text: string, query: string | undefined): JSX.Element {
  if (!query || !query.trim()) return <>{text}</>;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <span key={index} className="search-highlight">{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
}

export function CategoryFactCard({ 
  fact, 
  categoryColor,
  onSave, 
  onShare, 
  onComment,
  onBetaClick,
  highlightQuery,
  isSaved
}: CategoryFactCardProps) {
  const factLink = fact.link || `/fact/${fact.id}`;
  const photoSrc = fact.coverPhoto || placeholderPhoto;

  const handleBetaLinkClick = (e: React.MouseEvent) => {
    if (fact.betaOnly) {
      e.preventDefault();
      if (onBetaClick) {
        const slug = factLink.split('/fact/').pop() || fact.id;
        onBetaClick(slug);
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
            {((fact.factFilters && fact.factFilters.length > 0) || fact.taughtUntilYear) && (
              <div className="category-fact-tags">
                {fact.factFilters && fact.factFilters.map((filter, index) => {
                  const isOfficialRevision = filter.toLowerCase() === "official revision";
                  const label = isOfficialRevision && fact.revisionYear
                    ? `Official Revision · ${fact.revisionYear}`
                    : toTitleCase(filter);
                  return (
                    <span key={index} className="category-fact-tag" data-testid={`filter-${filter.toLowerCase().replace(/\s+/g, '-')}`}>
                      {label}
                    </span>
                  );
                })}
                {fact.taughtUntilYear && (
                  <span className="category-fact-tag category-fact-taught-until-tag" data-testid={`label-taught-until-${fact.id}`}>
                    Widely Taught Until {fact.taughtUntilYear}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="category-fact-body">
            <div className="category-fact-content">
              <div className="category-fact-section">
                <div className="category-fact-statement">
                  <X className="category-fact-icon myth-icon" />
                  <p className="category-fact-text myth-text">"{highlightText(fact.myth, highlightQuery)}"</p>
                </div>
                
                <div className="category-fact-statement">
                  <Check className="category-fact-icon truth-icon" />
                  <p className="category-fact-text truth-text">{highlightText(fact.truth, highlightQuery)}</p>
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
            className={`category-action-button${isSaved ? ' category-action-button-saved' : ''}`}
            onClick={onSave}
            data-testid={`button-save-${fact.id}`}
          >
            <Bookmark size={16} className={isSaved ? 'saved-icon' : ''} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
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
          {fact.betaOnly ? "View sources" : "Learn more"}
        </Link>
      </div>
    </div>
  );
}
