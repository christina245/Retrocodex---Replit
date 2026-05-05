import { useQuery } from "@tanstack/react-query";
import { X, Loader2, Globe } from "lucide-react";
import { Link } from "wouter";
import type { Fact } from "@shared/schema";
import "./RegionModal.css";

interface RegionModalProps {
  region: string | null;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  "History": "#D29E00",
  "Life Sciences": "#419F36",
  "Health & Fitness": "#EC7200",
  "Social Sciences": "#9D0085",
  "Gender & Sexuality": "#FF6F98",
  "Everyday Life": "#0167A2",
  "Other": "#2C2C2C",
};

export function RegionModal({ region, onClose }: RegionModalProps) {
  const { data: facts, isLoading } = useQuery<Fact[]>({
    queryKey: ["/api/facts/by-region", region],
    queryFn: async () => {
      const res = await fetch(`/api/facts/by-region/${encodeURIComponent(region!)}`);
      if (!res.ok) throw new Error("Failed to fetch facts");
      return res.json();
    },
    enabled: region !== null,
  });

  if (!region) return null;

  return (
    <div
      className="region-modal-overlay"
      onClick={onClose}
      data-testid="region-modal-overlay"
    >
      <div
        className="region-modal"
        onClick={(e) => e.stopPropagation()}
        data-testid="region-modal"
      >
        <div className="region-modal-header">
          <div className="region-modal-title">
            <Globe size={20} />
            <h2>{region}</h2>
          </div>
          <button
            className="region-modal-close"
            onClick={onClose}
            data-testid="button-region-modal-close"
          >
            <X size={20} />
          </button>
        </div>

        <p className="region-modal-subtitle">
          Myths and misconceptions associated with this region
        </p>

        <div className="region-modal-body">
          {isLoading ? (
            <div className="region-modal-loading" data-testid="region-modal-loading">
              <Loader2 size={26} className="region-modal-spinner" />
              <p>Loading facts…</p>
            </div>
          ) : !facts || facts.length === 0 ? (
            <p className="region-modal-empty" data-testid="region-modal-empty">
              No facts have been assigned to this region yet.
            </p>
          ) : (
            <div className="region-modal-facts" data-testid="region-modal-facts">
              {facts.map((fact) => {
                const primaryCategory = fact.categories[0] || "Other";
                const color = CATEGORY_COLORS[primaryCategory] || "#2C2C2C";
                return (
                  <Link
                    key={fact.id}
                    href={`/fact/${fact.slug}`}
                    className="region-modal-fact-link"
                    onClick={onClose}
                  >
                    <div
                      className="region-fact-card"
                      data-testid={`region-fact-card-${fact.id}`}
                    >
                      <span
                        className="region-fact-category"
                        style={{ color, borderColor: color }}
                      >
                        {primaryCategory}
                      </span>
                      <p className="region-fact-myth">{fact.mythHeader}</p>
                      <p className="region-fact-truth">{fact.truthHeader}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
