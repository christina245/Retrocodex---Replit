import { useState } from "react";
import { X, Check, MessageCircle, Bookmark, Share2, BookOpen } from "lucide-react";
import { Link, useLocation } from "wouter";
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
  originDecade?: string;
  commentCount?: number;
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
  onComment,
  highlightQuery,
  isSaved,
}: CategoryFactCardProps) {
  const factLink = fact.link || `/fact/${fact.id}`;
  const photoSrc = fact.coverPhoto || placeholderPhoto;
  const [, setLocation] = useLocation();
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${factLink}`);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLocation(`${factLink}#comments`);
  };

  const count = fact.commentCount ?? 0;
  const commentLabel = count === 1 ? "1 comment" : `${count} comments`;

  return (
    <div className="category-fact-card-wrapper">
      <div className="category-fact-card-row">
        <div 
          className="category-fact-card"
          style={{ '--card-category-color': categoryColor } as React.CSSProperties}
          data-testid={`card-fact-${fact.id}`}
        >
          <div className="category-fact-header">
            {(() => {
              const FACT_TYPE_KEYS = ["school", "folk wisdom", "media claims"];
              const hasOfficialRevision = fact.factFilters?.some(f => f.toLowerCase() === "official revision") ?? false;
              const showTaughtUntil = !!fact.taughtUntilYear && !hasOfficialRevision;
              const isMediaClaims = fact.factFilters?.some(f => f.toLowerCase() === "media claims") ?? false;
              const displayFilters = (fact.factFilters || []).filter(f => !FACT_TYPE_KEYS.includes(f.toLowerCase()));
              if (!(isMediaClaims || displayFilters.length > 0 || showTaughtUntil)) return null;
              return (
                <div className="category-fact-tags">
                  {isMediaClaims && (
                    <span className="category-fact-tag category-fact-media-claims-tag" data-testid={`label-media-claims-${fact.id}`}>
                      Media Claims
                    </span>
                  )}
                  {displayFilters.map((filter, index) => {
                    const isOfficialRevision = filter.toLowerCase() === "official revision";
                    const label = isOfficialRevision && fact.revisionYear
                      ? `Official Revision \u00a0-\u00a0 ${fact.revisionYear}`
                      : toTitleCase(filter);
                    return (
                      <span key={index} className={`category-fact-tag${isOfficialRevision ? " category-fact-official-revision-tag" : ""}`} data-testid={`filter-${filter.toLowerCase().replace(/\s+/g, '-')}`}>
                        {label}
                      </span>
                    );
                  })}
                  {showTaughtUntil && (
                    <span className="category-fact-tag category-fact-taught-until-tag" data-testid={`label-taught-until-${fact.id}`}>
                      {fact.originDecade && fact.taughtUntilYear
                        ? `Taught From ${fact.originDecade} to ${fact.taughtUntilYear}`
                        : `Taught Until ${fact.taughtUntilYear}`}
                    </span>
                  )}
                </div>
              );
            })()}
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
          <button
            className="category-action-button"
            data-testid={`button-comment-${fact.id}`}
            onClick={handleCommentClick}
          >
            <MessageCircle size={16} />
            <span>{commentLabel}</span>
          </button>
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
            onClick={handleShare}
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
        >
          <BookOpen size={14} className="category-learn-more-arrow" />
          View Sources
        </Link>
      </div>

      {showCopiedToast && (
        <div className="copied-toast" data-testid="toast-copied-fact">
          Copied link to fact
        </div>
      )}
    </div>
  );
}
