import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { HeaderDark as Header } from "@/components/HeaderDark";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { CommentsSection } from "@/components/CommentsSection";
import { CategoryLinks } from "@/components/CategoryLinks";
import { SignInModal } from "@/components/SignInModal";
import { evolvedTermsPeople, type EvolvedTerm } from "@/data/evolvedTerms";
import { evolvedTermsActions } from "@/data/evolvedTermsActions";
import type { Page } from "@shared/schema";
import scrungyAndSeal from "@assets/scrungy_and_seal_talking_1776809939153.png";
import "./FormerCountriesPage.css";
import "./EvolvingSlangPage.css";

type SortKey = keyof Pick<
  EvolvedTerm,
  "era" | "term" | "originatedFrom" | "directionOfShift"
>;
type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey | null; label: string; sortable: boolean }[] = [
  { key: "era", label: "Era", sortable: true },
  { key: "term", label: "Term", sortable: true },
  { key: "originatedFrom", label: "Originated From", sortable: true },
  { key: null, label: "Original Meaning", sortable: false },
  { key: null, label: "Current Meaning", sortable: false },
  { key: "directionOfShift", label: "Direction of Shift", sortable: true },
];

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="fc-sort-arrow fc-sort-inactive">▲</span>;
  return (
    <span className="fc-sort-arrow fc-sort-active">
      {dir === "asc" ? "▲" : "▼"}
    </span>
  );
}

function eraSortValue(era: string): number {
  // Convert "1990s" → 1990 for numeric sort
  const m = era.match(/(\d{4})/);
  return m ? parseInt(m[1], 10) : 0;
}

function SlangTable({
  rows,
  testIdPrefix,
}: {
  rows: EvolvedTerm[];
  testIdPrefix: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("era");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      let cmp: number;
      if (sortKey === "era") {
        cmp = eraSortValue(a.era) - eraSortValue(b.era);
        if (cmp === 0) cmp = a.term.localeCompare(b.term);
      } else {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        cmp = av.toString().localeCompare(bv.toString(), undefined, { numeric: true });
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  return (
    <div className="fc-table-scroll">
      <div className="fc-table-container">
        <table className="fc-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.label}
                  className={col.sortable ? "fc-th fc-th-sortable" : "fc-th"}
                  onClick={col.sortable && col.key ? () => handleSort(col.key!) : undefined}
                  data-testid={`th-${testIdPrefix}-${col.label.replace(/\s+/g, "-").toLowerCase()}`}
                >
                  <span className="fc-th-inner">
                    {col.label}
                    {col.sortable && col.key && (
                      <SortArrow active={sortKey === col.key} dir={sortDir} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => (
              <tr
                key={`${row.term}-${row.era}`}
                className={idx === sorted.length - 1 ? "fc-tr fc-tr-last" : "fc-tr"}
                data-testid={`row-${testIdPrefix}-${idx}`}
              >
                <td className="fc-td es-td-era" data-testid={`text-${testIdPrefix}-era-${idx}`}>
                  {row.era}
                </td>
                <td className="fc-td es-td-term" data-testid={`text-${testIdPrefix}-term-${idx}`}>
                  {row.sourceUrl ? (
                    <a
                      href={row.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="es-term-link"
                    >
                      {row.term}
                    </a>
                  ) : (
                    row.term
                  )}
                </td>
                <td className="fc-td es-td-originated" data-testid={`text-${testIdPrefix}-originated-${idx}`}>
                  {row.originatedFrom}
                </td>
                <td className="fc-td es-td-original" data-testid={`text-${testIdPrefix}-original-${idx}`}>
                  {row.originalMeaning}
                </td>
                <td className="fc-td es-td-current" data-testid={`text-${testIdPrefix}-current-${idx}`}>
                  {row.currentMeaning}
                </td>
                <td className="fc-td es-td-direction" data-testid={`text-${testIdPrefix}-direction-${idx}`}>
                  {row.directionOfShift}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function EvolvingSlangPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInContext, setSignInContext] = useState("");

  const { data: pageData, isError: pageError } = useQuery<Page>({
    queryKey: ["/api/pages/by-slug/evolving-slang"],
  });

  return (
    <>
      <SEO
        title="List of American English slang that evolved over time | Retrocodex"
        description="A list of everyday American English slang terms whose meanings have shifted over time, with their origins, original meanings, and current usage."
      />
      <Header onMenuClick={() => setMenuOpen(true)} hideTagline />
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <HomepageCategoryNav />

      <main className="fc-main">
        <div className="fc-content">
          <div className="fc-intro-row">
            <div className="fc-intro-left">
              <h1 className="fc-title">List of American English everyday terms that evolved over time</h1>
              <p className="fc-description">
                What casual terms for people and things no longer mean what you thought they did? Here's a list of slang and other words you might have heard in everyday life that have generally shifted in meaning from their origins.
              </p>
            </div>
            <div className="fc-intro-image-col">
              <img src={scrungyAndSeal} alt="Scrungy and a seal talking" className="fc-intro-image" />
            </div>
          </div>

          <section className="es-section">
            <h2 className="es-section-heading" data-testid="heading-people">Descriptions of people</h2>
            <SlangTable rows={evolvedTermsPeople} testIdPrefix="people" />
          </section>

          <section className="es-section">
            <h2 className="es-section-heading" data-testid="heading-actions">Adjectives and verbs</h2>
            <SlangTable rows={evolvedTermsActions} testIdPrefix="actions" />
          </section>

          <div className="fc-divider" />

          <div className="fc-below-grid">
            <div className="fc-comments-col" id="comments">
              {pageData?.id ? (
                <CommentsSection
                  pageId={pageData.id}
                  onLoginClick={(msg) => { setSignInContext(msg); setShowSignIn(true); }}
                />
              ) : pageError ? (
                <p className="text-sm text-muted-foreground">Comments are temporarily unavailable.</p>
              ) : null}
            </div>
            <div className="fc-sidebar-col">
              <CategoryLinks categories={["EVERYDAY LIFE"]} />
            </div>
          </div>
        </div>
      </main>

      {showSignIn && (
        <SignInModal
          isOpen={showSignIn}
          onClose={() => setShowSignIn(false)}
          context={signInContext}
        />
      )}

      <Footer />
    </>
  );
}
