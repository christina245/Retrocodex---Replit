import { X, Check, BookOpen, Bookmark, Share2 } from "lucide-react";
import "./ExtendedFactCard.css";

interface Source {
  id: string;
  citation: string;
  link: string;
  logoUrl?: string;
}

interface ExtendedFactCardProps {
  fact: {
    myth: string;
    truth: string;
    category: string[];
    details: string;
    moreDetails?: string;
    sources: Source[];
  };
  onSave?: () => void;
  onShare?: () => void;
}

export default function ExtendedFactCard({ fact, onSave, onShare }: ExtendedFactCardProps) {
  return (
    <div className="extended-fact-card" data-testid="extended-fact-card">
      <div className="extended-fact-content">
        <div className="fact-section">
          <div className="fact-label">
            <X className="fact-icon fact-icon-myth" size={16} />
            <span className="label-text">YOU MIGHT HAVE BEEN TAUGHT</span>
          </div>
          <p className="fact-myth">"{fact.myth}"</p>
        </div>

        <div className="fact-section">
          <div className="fact-label">
            <Check className="fact-icon fact-icon-truth" size={16} />
            <span className="label-text">CURRENT UNDERSTANDING</span>
          </div>
          <p className="fact-truth">{fact.truth}</p>
          <p className="fact-details">{fact.details}</p>
          {fact.moreDetails && (
            <p className="fact-more-details">{fact.moreDetails}</p>
          )}
        </div>

        <div className="fact-section">
          <div className="fact-label">
            <BookOpen className="fact-icon fact-icon-sources" size={16} />
            <span className="label-text">SOURCES</span>
          </div>
          
          <div className="sources-list">
            {fact.sources.map((source, idx) => (
              <div key={source.id} className="source-item">
                {source.logoUrl && (
                  <a
                    href={source.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-logo-link"
                  >
                    <img 
                      src={source.logoUrl} 
                      alt="Source logo" 
                      className="source-logo"
                    />
                  </a>
                )}
                <a
                  href={source.link}
                  className="source-citation"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`source-link-${idx}`}
                >
                  {source.citation}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="floating-actions">
        <button 
          className="floating-action-button"
          onClick={onSave}
          data-testid="button-save-extended"
          aria-label="Save fact"
        >
          <Bookmark size={20} />
        </button>
        <button 
          className="floating-action-button"
          onClick={onShare}
          data-testid="button-share-extended"
          aria-label="Share fact"
        >
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
}
