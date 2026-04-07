import { useEffect } from "react";
import { X, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import squirrelImg from "@assets/scrungy_at_work_painted_1775522114338.png";
import type { Fact as DbFact, Source } from "@shared/schema";
import "./SourcesModal.css";

interface SourcesModalProps {
  factId: string | null;
  onClose: () => void;
}

export function SourcesModal({ factId, onClose }: SourcesModalProps) {
  const isOpen = factId !== null;

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const { data: factData, isLoading, isError } = useQuery<DbFact>({
    queryKey: ["/api/facts", factId],
    queryFn: async () => {
      const res = await fetch(`/api/facts/${factId}`);
      if (!res.ok) throw new Error("Fact not found");
      return res.json();
    },
    enabled: !!factId,
  });

  if (!isOpen) return null;

  const sources = factData?.sources ?? [];

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="sources-modal-overlay"
      onClick={handleOverlayClick}
      data-testid="sources-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="View sources"
    >
      <div className="sources-modal-container" data-testid="sources-modal-container">
        <button
          className="sources-modal-close"
          onClick={onClose}
          data-testid="button-sources-modal-close"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="sources-modal-header">
          <BookOpen size={30} className="sources-modal-book-icon" />
          <h1 className="category-page-h1 sources-modal-title">Sources</h1>
        </div>

        <div className="sources-modal-body">
          {isLoading ? (
            <p className="sources-modal-empty" data-testid="sources-loading">
              Loading sources...
            </p>
          ) : isError ? (
            <p className="sources-modal-empty" data-testid="sources-error">
              Unable to retrieve sources.
            </p>
          ) : sources.length === 0 ? (
            <p className="sources-modal-empty" data-testid="sources-empty">
              No sources yet.
            </p>
          ) : (
            <ul className="sources-modal-list" data-testid="sources-list">
              {(sources as Source[]).map((source) => (
                <li key={source.id} className="sources-modal-list-item">
                  <a
                    href={source.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sources-modal-link"
                    data-testid={`link-source-${source.id}`}
                  >
                    {source.citation}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="sources-modal-squirrel-section">
          <p className="sources-modal-squirrel-text">
            Scrungy the squirrel is grabbing the rest of this fact's details!
          </p>
          <img
            src={squirrelImg}
            alt="Scrungy the squirrel working on the entry"
            className="sources-modal-squirrel"
            data-testid="img-squirrel"
          />
        </div>
      </div>
    </div>
  );
}
