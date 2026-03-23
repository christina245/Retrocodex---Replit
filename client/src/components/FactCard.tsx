import { MessageCircle, Bookmark, Share2, X, Check, Scroll, Dna, Home, Dumbbell, Users, Heart, Zap, Activity, HeartHandshake, DiamondPlus } from "lucide-react";
import { Link } from "wouter";
import forwardArrow from "@assets/forward triangle red.png";
import placeholderPhoto from "@assets/stock_images/ancient_history_colo_d71bf0e6.jpg";
import "./FactCard.css";

const categoryIcons: Record<string, typeof Scroll> = {
  "HISTORY": Scroll,
  "LIFE SCIENCES": Dna,
  "EVERYDAY LIFE": Home,
  "HEALTH & FITNESS": Activity,
  "SOCIAL SCIENCES": Users,
  "GENDER & SEXUALITY": HeartHandshake,
  "OTHER": DiamondPlus,
};

function getCategoryIcon(category: string) {
  if (category.startsWith("OTHER")) {
    return DiamondPlus;
  }
  return categoryIcons[category] || DiamondPlus;
}

export interface Fact {
  id: string;
  category: string;
  categoryColor: string;
  myth: string;
  truth: string;
  dateAdded?: string;
  link?: string;
  coverPhoto?: string;
  betaOnly?: boolean;
  factFilters?: string[];
  revisionYear?: number;
}

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

interface FactCardProps {
  fact: Fact;
  onSave: () => void;
  onShare: () => void;
  onComment: () => void;
  onBetaClick?: () => void;
  isSaved?: boolean;
}

export function FactCard({ fact, onSave, onShare, onComment, onBetaClick, isSaved }: FactCardProps) {
  const CategoryIcon = getCategoryIcon(fact.category);
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
    <div className="fact-card-wrapper">
      <div className="fact-card-row">
        <div 
          className="fact-card"
          data-testid={`card-fact-${fact.id}`}
        >
          <div 
            className="fact-category"
            style={{ backgroundColor: `${fact.categoryColor}33` }}
          >
            <div className="fact-category-left">
              <CategoryIcon size={12} style={{ color: fact.categoryColor }} className="category-icon-small" />
              <span className="category-badge">{fact.category}</span>
            </div>
            {fact.factFilters && fact.factFilters.length > 0 && (
              <div className="fact-filter-tags">
                {fact.factFilters.map((filter, index) => {
                  const isOfficialRevision = filter.toLowerCase() === "official revision";
                  const label = isOfficialRevision && fact.revisionYear
                    ? `Official Revision · ${fact.revisionYear}`
                    : toTitleCase(filter);
                  return (
                    <span key={index} className="fact-filter-tag" data-testid={`filter-${filter.toLowerCase().replace(/\s+/g, '-')}`}>
                      {label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="fact-body">
            <div className="fact-content">
              <div className="fact-section">
                <div className="fact-statement myth">
                  <X className="fact-icon myth-icon" />
                  <p className="fact-text myth-text">"{fact.myth}"</p>
                </div>
              </div>

              <div className="fact-section">
                <div className="fact-statement truth">
                  <Check className="fact-icon truth-icon" />
                  <p className="fact-text truth-text">{fact.truth}</p>
                </div>
              </div>
            </div>

            <div className="fact-photo">
              <img 
                src={photoSrc} 
                alt="" 
                className="fact-photo-img"
                data-testid={`photo-fact-${fact.id}`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="fact-footer">
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
            className={`action-button${isSaved ? ' action-button-unsave' : ''}`}
            onClick={onSave}
            data-testid={`button-save-${fact.id}`}
          >
            <Bookmark size={16} className={isSaved ? 'unsave-icon' : ''} />
            <span>{isSaved ? 'Unsave' : 'Save'}</span>
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

        <Link 
          href={factLink}
          className="learn-more-button"
          data-testid={`button-learn-more-${fact.id}`}
          onClick={handleBetaLinkClick}
        >
          <img src={forwardArrow} alt="" className="learn-more-arrow" />
          Learn more
        </Link>
      </div>
    </div>
  );
}
