import { MessageCircle, Bookmark, Share2, X, Check, Scroll, Dna, Home, Dumbbell, Users, Heart, Zap, Activity, HeartHandshake, DiamondPlus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import forwardArrow from "@assets/forward triangle red.png";
import placeholderPhoto from "@assets/stock_images/ancient_history_colo_d71bf0e6.jpg";
import "./FactCard.css";

const FILTER_TOOLTIPS: Record<string, string> = {
  "official revision": "This fact was formally revised or replaced by an official authority in a specific year.",
  "partially true": "This fact contains an element of truth, but may be incomplete, oversimplified, misunderstood, or missing important context that affects its accuracy.",
  "context matters": "The validity of this fact differs depending on how key terms are defined or interpreted.",
  "regionally taught": "This fact is mostly taught or believed in certain regions or cultures.",
  "controversial": "This topic is subject to ongoing debate and differing interpretations among experts or the public.",
  "uncertain": "Consensus on this fact's validity varies among experts.",
};

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
  taughtUntilYear?: string;
  commentCount?: number;
}

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

interface FactCardProps {
  fact: Fact;
  onSave: () => void;
  onShare: () => void;
  onComment?: () => void;
  onBetaClick?: (factId: string) => void;
  isSaved?: boolean;
  showTaughtUntilLabel?: boolean;
}

export function FactCard({ fact, onSave, onShare, onComment, onBetaClick, isSaved, showTaughtUntilLabel }: FactCardProps) {
  const CategoryIcon = getCategoryIcon(fact.category);
  const factLink = fact.link || `/fact/${fact.id}`;
  const photoSrc = fact.coverPhoto || placeholderPhoto;
  const [, setLocation] = useLocation();

  const handleBetaLinkClick = (e: React.MouseEvent) => {
    if (fact.betaOnly) {
      e.preventDefault();
      if (onBetaClick) {
        const slug = factLink.split('/fact/').pop() || fact.id;
        onBetaClick(slug);
      }
    }
  };

  const handleCommentClick = () => {
    if (fact.betaOnly) {
      if (onBetaClick) {
        const slug = factLink.split('/fact/').pop() || fact.id;
        onBetaClick(slug);
      }
      return;
    }
    setLocation(`${factLink}#comments`);
  };

  const count = fact.commentCount ?? 0;
  const commentLabel = count === 1 ? "1 comment" : `${count} comments`;
  
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
            {((fact.factFilters && fact.factFilters.length > 0) || (showTaughtUntilLabel && fact.taughtUntilYear)) && (
              <div className="fact-filter-tags">
                {fact.factFilters && fact.factFilters.map((filter, index) => {
                  const isOfficialRevision = filter.toLowerCase() === "official revision";
                  const label = isOfficialRevision && fact.revisionYear
                    ? `Official Revision · ${fact.revisionYear}`
                    : toTitleCase(filter);
                  const tooltipText = FILTER_TOOLTIPS[filter.toLowerCase()];
                  const chip = (
                    <span key={index} className="fact-filter-tag" data-testid={`filter-${filter.toLowerCase().replace(/\s+/g, '-')}`}>
                      {label}
                    </span>
                  );
                  return tooltipText ? (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>{chip}</TooltipTrigger>
                      <TooltipContent side="bottom" className="fact-filter-tooltip bg-[#2C2C2C] text-white border-0 z-[9999]">
                        <p>{tooltipText}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : chip;
                })}
                {showTaughtUntilLabel && fact.taughtUntilYear && (
                  <span className="fact-filter-tag fact-taught-until-tag" data-testid={`label-taught-until-${fact.id}`}>
                    Widely Taught Until {fact.taughtUntilYear}
                  </span>
                )}
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
            onClick={handleCommentClick}
            data-testid={`button-comment-${fact.id}`}
          >
            <MessageCircle size={16} />
            <span>{commentLabel}</span>
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
          {fact.betaOnly ? "View sources" : "Learn more"}
        </Link>
      </div>
    </div>
  );
}
