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
  // Split sources into those with logos and those without
  const sourcesWithLogos = fact.sources.filter(s => s.logoUrl);
  const textOnlySources = fact.sources.filter(s => !s.logoUrl);

  return (
    <div className="extended-fact-card-wrapper" data-testid="extended-fact-card">
      <div className="extended-fact-card">
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
            
            {/* Logo sources in 2-column grid */}
            {sourcesWithLogos.length > 0 && (
              <div className="sources-logo-grid">
                {sourcesWithLogos.map((source, idx) => (
                  <a
                    key={source.id}
                    href={source.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-logo-item"
                    data-testid={`source-logo-${idx}`}
                  >
                    <img 
                      src={source.logoUrl} 
                      alt={source.citation} 
                      className="source-logo"
                    />
                    <span className="source-logo-citation">{source.citation}</span>
                  </a>
                ))}
              </div>
            )}

            {/* Text-only sources in single column */}
            {textOnlySources.length > 0 && (
              <div className="sources-text-list">
                {textOnlySources.map((source, idx) => (
                  <a
                    key={source.id}
                    href={source.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-text-item"
                    data-testid={`source-text-${idx}`}
                  >
                    {source.citation}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="side-actions">
        <button 
          className="side-action-button"
          onClick={onSave}
          data-testid="button-save-extended"
          aria-label="Save fact"
        >
          <Bookmark size={20} />
        </button>
        <button 
          className="side-action-button"
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
