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
import { formerCountries, FormerCountry } from "@/data/formerCountries";
import type { Page } from "@shared/schema";
import scrungyWorldMap from "@assets/scrungy_world_map_1776760529860.png";
import "./FormerCountriesPage.css";

type SortKey = keyof Pick<
  FormerCountry,
  "yearEnded" | "formerNation" | "yearEstablished" | "presentNations" | "endedBy"
>;

type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey | null; label: string; sortable: boolean }[] = [
  { key: "yearEnded", label: "Year Ended", sortable: true },
  { key: "formerNation", label: "Former Country Name", sortable: true },
  { key: "yearEstablished", label: "Year Established", sortable: true },
  { key: "presentNations", label: "Present Name(s)", sortable: true },
  { key: "endedBy", label: "Ended By", sortable: true },
  { key: null, label: "Reason", sortable: false },
];

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="fc-sort-arrow fc-sort-inactive">▲</span>;
  return (
    <span className="fc-sort-arrow fc-sort-active">
      {dir === "asc" ? "▲" : "▼"}
    </span>
  );
}

export default function FormerCountriesPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("yearEnded");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInContext, setSignInContext] = useState("");

  const { data: pageData, isError: pageError } = useQuery<Page>({
    queryKey: ["/api/pages/by-slug/former-countries"],
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    return [...formerCountries].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = av.toString().localeCompare(bv.toString(), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [sortKey, sortDir]);

  return (
    <>
      <SEO
        title="List of Former Countries (1930–2026) | Retrocodex"
        description="A list of former countries sorted by the year they ceased to exist."
      />
      <Header onMenuClick={() => setMenuOpen(true)} hideTagline />
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <HomepageCategoryNav />

      <main className="fc-main">
        <div className="fc-content">
          <div className="fc-intro-row">
            <div className="fc-intro-left">
              <h1 className="fc-title">Countries and territories that no longer exist (1930-2026)</h1>
              <p className="fc-description">
                What countries, states, kingdoms, federations, or geopolitical unions did you learn about in school that didn't last? Here's a list sorted by the year they merged, dissolved, or were renamed to assert a fresh new identity.
              </p>
            </div>
            <div className="fc-intro-image-col">
              <img src={scrungyWorldMap} alt="Scrungy pointing at a world map" className="fc-intro-image" />
            </div>
          </div>

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
                        data-testid={`th-${col.label.replace(/\s+/g, "-").toLowerCase()}`}
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
                      key={`${row.formerNation}-${row.yearEnded}`}
                      className={idx === sorted.length - 1 ? "fc-tr fc-tr-last" : "fc-tr"}
                      data-testid={`row-country-${idx}`}
                    >
                      <td className="fc-td fc-td-year" data-testid={`text-year-ended-${idx}`}>
                        {row.yearEnded}
                      </td>

                      <td className="fc-td fc-td-nation" data-testid={`text-nation-${idx}`}>
                        {row.sourceUrl ? (
                          <a
                            href={row.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="fc-nation-link"
                          >
                            <span className="fc-nation-bold">{row.formerNation}</span>
                            {row.altName && (
                              <span className="fc-nation-alt"> (also known as {row.altName})</span>
                            )}
                          </a>
                        ) : (
                          <>
                            <span className="fc-nation-bold">{row.formerNation}</span>
                            {row.altName && (
                              <span className="fc-nation-alt"> (also known as {row.altName})</span>
                            )}
                          </>
                        )}
                      </td>

                      <td className="fc-td" data-testid={`text-year-established-${idx}`}>
                        {row.yearEstablished}
                      </td>

                      <td className="fc-td" data-testid={`text-present-nations-${idx}`}>
                        {row.presentNations}
                      </td>

                      <td className="fc-td fc-td-ended-by" data-testid={`text-ended-by-${idx}`}>
                        {row.endedBy}
                      </td>

                      <td className="fc-td fc-td-summary" data-testid={`text-summary-${idx}`}>
                        {row.summary}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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
              <CategoryLinks categories={["HISTORY"]} />
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
