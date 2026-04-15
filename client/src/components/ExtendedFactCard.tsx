import { useState } from "react";
import { X, Check, BookOpen, Bookmark, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import "./ExtendedFactCard.css";

function normalizeMarkdown(text: string): string {
  return text.replace(/\n(?!\n)/g, "\n\n");
}

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
  isSaved?: boolean;
}

export default function ExtendedFactCard({ fact, onSave, isSaved }: ExtendedFactCardProps) {
  // Split sources into those with logos and those without
  const sourcesWithLogos = fact.sources.filter(s => s.logoUrl);
  const textOnlySources = fact.sources.filter(s => !s.logoUrl);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="extended-fact-card-wrapper" data-testid="extended-fact-card">
      <div className="extended-fact-card">
        <div className="extended-fact-content">
          <div className="fact-section">
            <div className="fact-label">
              <X className="fact-icon fact-icon-myth" size={16} />
              <span className="label-text">YOU MIGHT HAVE BEEN TAUGHT</span>
            </div>
            <h1 className="fact-myth">"{fact.myth}"</h1>
            <div className="fact-details">
              <ReactMarkdown
                rehypePlugins={[rehypeSanitize]}
                components={{
                  p: ({ children }) => <p>{children}</p>,
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {normalizeMarkdown(fact.details)}
              </ReactMarkdown>
            </div>
          </div>

          <div className="fact-section">
            <div className="fact-label">
              <Check className="fact-icon fact-icon-truth" size={16} />
              <span className="label-text">CURRENT UNDERSTANDING</span>
            </div>
            <p className="fact-truth">{fact.truth}</p>
            {fact.moreDetails && (
              <div className="fact-more-details">
                <ReactMarkdown
                  rehypePlugins={[rehypeSanitize]}
                  components={{
                    p: ({ children }) => <p>{children}</p>,
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {normalizeMarkdown(fact.moreDetails)}
                </ReactMarkdown>
              </div>
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

      <div className="floating-actions">
        <button 
          className={`floating-action-button${isSaved ? ' floating-action-button-saved' : ''}`}
          onClick={onSave}
          data-testid="button-save-extended"
          aria-label={isSaved ? "Unsave fact" : "Save fact"}
        >
          <Bookmark size={20} className={isSaved ? 'bookmark-saved' : ''} />
        </button>
        <button 
          className="floating-action-button"
          onClick={handleShare}
          data-testid="button-share-extended"
          aria-label="Share fact"
        >
          <Share2 size={20} />
        </button>
      </div>

      {showCopiedToast && (
        <div className="copied-toast" data-testid="toast-copied-fact">
          Copied link to fact
        </div>
      )}
    </div>
  );
}
