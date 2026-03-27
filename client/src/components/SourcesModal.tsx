import { useEffect } from "react";
import { X, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import squirrelImg from "@assets/Scrungy_the_squirrel_at_work_cropped_1774648658154.png";
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

  useEffect(() => {
    if (document.getElementById("beehiiv-sources-embed-script")) return;
    const script = document.createElement("script");
    script.id = "beehiiv-sources-embed-script";
    script.src = "https://subscribe-forms.beehiiv.com/embed.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

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
          <div className="sources-modal-beehiiv-cta" data-testid="beehiiv-cta">
            <iframe
              src="https://subscribe-forms.beehiiv.com/70a66f54-86dc-4762-bd13-4631482f617e"
              className="beehiiv-embed"
              data-test-id="beehiiv-embed"
              frameBorder={0}
              scrolling="no"
              style={{
                width: "636px",
                height: "199px",
                margin: 0,
                borderRadius: "0px",
                backgroundColor: "transparent",
                boxShadow: "0 0 #0000",
                maxWidth: "100%",
              }}
            />
          </div>
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
