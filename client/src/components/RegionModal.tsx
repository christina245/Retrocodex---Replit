import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import type { Fact as DbFact } from "@shared/schema";
import { FactCard, type Fact as FactCardFact } from "./FactCard";
import { SaveModal } from "./SaveModal";
import { getCountryFlag, COUNTRY_NAMES } from "@/lib/countryFlags";
import "./RegionModal.css";

const CATEGORY_COLORS: Record<string, string> = {
  "History": "#D29E00",
  "Life Sciences": "#419F36",
  "Health & Fitness": "#EC7200",
  "Social Sciences": "#9D0085",
  "Gender & Sexuality": "#FF6F98",
  "Everyday Life": "#0167A2",
  "Other": "#2C2C2C",
};

const ITEMS_PER_PAGE = 10;

type DbFactWithCount = DbFact & { commentCount?: number };

function dbFactToCardFact(fact: DbFactWithCount): FactCardFact {
  const primaryCategory = fact.categories[0] || "Other";
  const categoryDisplay =
    primaryCategory === "Other" && fact.subcategories?.[0]
      ? `OTHER • ${fact.subcategories[0].toUpperCase()}`
      : primaryCategory.toUpperCase();
  return {
    id: fact.id,
    category: categoryDisplay,
    categoryColor: CATEGORY_COLORS[primaryCategory] || "#2C2C2C",
    myth: fact.mythHeader,
    truth: fact.truthHeader,
    link: `/fact/${fact.slug}`,
    coverPhoto: fact.coverPhoto ?? undefined,
    factFilters: fact.factFilters ?? [],
    commentCount: fact.commentCount ?? 0,
  };
}

interface RegionModalProps {
  region: string | null;
  isCountry?: boolean;
  onClose: () => void;
}

export function RegionModal({ region, isCountry = false, onClose }: RegionModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [region]);

  const { data: facts, isLoading } = useQuery<DbFactWithCount[]>({
    queryKey: ["/api/facts/by-region", region],
    queryFn: async () => {
      const res = await fetch(`/api/facts/by-region/${encodeURIComponent(region!)}`);
      if (!res.ok) throw new Error("Failed to fetch facts");
      return res.json();
    },
    enabled: region !== null,
  });

  if (!region) return null;

  const flag = isCountry ? getCountryFlag(region) : "";
  const totalPages = facts ? Math.ceil(facts.length / ITEMS_PER_PAGE) : 0;
  const pagedFacts = facts
    ? facts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : [];

  return (
    <>
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
          <button
            className="region-modal-close"
            onClick={onClose}
            data-testid="button-region-modal-close"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="region-modal-header">
            <p className="region-modal-label">All submitted facts by users from</p>
            <h1 className="region-modal-title">
              {region}{flag ? ` ${flag}` : ""}
            </h1>
            <p className="region-modal-disclaimer">
              <strong>Note:</strong> the listed topics include both topics that may be specific to this country and topics that may be commonly taught worldwide, but was submitted by a user who reported specifically learning it in this country.
            </p>
          </div>

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
              <>
                <div className="region-modal-facts" data-testid="region-modal-facts">
                  {pagedFacts.map((fact) => (
                    <FactCard
                      key={fact.id}
                      fact={dbFactToCardFact(fact)}
                      onSave={() => setSaveModalOpen(true)}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="region-modal-pagination">
                    <button
                      className="region-pagination-btn"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      data-testid="button-region-prev-page"
                    >
                      Previous
                    </button>
                    <span className="region-pagination-info" data-testid="text-region-page-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="region-pagination-btn"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      data-testid="button-region-next-page"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <SaveModal isOpen={saveModalOpen} onClose={() => setSaveModalOpen(false)} />
    </>
  );
}
