import { useEffect, useRef } from "react";

interface WorldMapPlaceholderProps {
  onRegionClick: (region: { name: string; isCountry: boolean }) => void;
}

export function WorldMapPlaceholder({ onRegionClick }: WorldMapPlaceholderProps) {
  const onRegionClickRef = useRef(onRegionClick);
  onRegionClickRef.current = onRegionClick;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const assignedCountriesRef = useRef<string[] | null>(null);
  const mapReadyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    function trySendColors() {
      if (cancelled) return;
      if (!mapReadyRef.current) return;
      if (assignedCountriesRef.current === null) return;
      iframeRef.current?.contentWindow?.postMessage(
        { type: "fla-set-colors", assignedCountries: assignedCountriesRef.current },
        "*"
      );
    }

    /**
     * Sweep the iframe's SVG (via same-origin contentDocument) and hide any
     * element whose computed fill resolves to pure white — those are demo badge
     * elements.  Country fills are grey/red; borders are white STROKE not fill.
     * Also hides <a> and <image> elements which are never country shapes.
     */
    function removeDemoBadge() {
      try {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentDocument || !iframe.contentWindow) return;

        const iwin = iframe.contentWindow as Window;
        const idoc = iframe.contentDocument;

        const allEls = idoc.querySelectorAll("svg *");
        const hidden: string[] = [];

        allEls.forEach((el) => {
          const tag = el.tagName.toLowerCase();

          // Anchors and images are never country shapes
          if (tag === "a" || tag === "image") {
            (el as HTMLElement).style.cssText += ";display:none!important";
            hidden.push(`<${tag}>`);
            return;
          }

          // Use the iframe's own getComputedStyle so CSS context is correct
          try {
            const cs = iwin.getComputedStyle(el as Element);
            const fill = cs.fill || "";
            const isWhite =
              fill === "rgb(255, 255, 255)" ||
              fill === "rgba(255, 255, 255, 1)" ||
              fill === "#ffffff" ||
              fill.toLowerCase() === "white";
            if (isWhite) {
              (el as HTMLElement).style.cssText += ";display:none!important";
              hidden.push(`<${tag} fill="${fill}">`);
            }
          } catch (_) {
            // Fallback: check raw attribute
            const attrFill = (el.getAttribute("fill") || "").toLowerCase();
            if (attrFill === "#ffffff" || attrFill === "white" || attrFill === "#fff") {
              (el as HTMLElement).style.cssText += ";display:none!important";
              hidden.push(`<${tag} fill="${attrFill}">`);
            }
          }
        });

        if (hidden.length > 0) {
          console.log("[FLA] Hid badge elements:", hidden);
        } else {
          // Log all unique fills so we can see what's actually in the SVG
          const fills = new Set<string>();
          const tags = new Set<string>();
          allEls.forEach((el) => {
            tags.add(el.tagName);
            try {
              const f = iwin.getComputedStyle(el as Element).fill;
              if (f) fills.add(f);
            } catch (_) {}
          });
          console.log("[FLA] No white-fill badge found. Tags:", [...tags], "Fills:", [...fills]);
        }
      } catch (err) {
        console.error("[FLA] removeDemoBadge error:", err);
      }
    }

    function handleMessage(e: MessageEvent) {
      if (!e.data || cancelled) return;
      if (e.source !== iframeRef.current?.contentWindow) return;

      if (e.data.type === "fla-click" && e.data.name) {
        onRegionClickRef.current({
          name: e.data.name,
          isCountry: !!e.data.isCountry,
        });
      }

      if (e.data.type === "fla-ready") {
        mapReadyRef.current = true;
        if (iframeRef.current && e.data.height) {
          iframeRef.current.style.height = `${e.data.height}px`;
        }
        trySendColors();

        // Remove badge immediately then re-sweep a few times to catch
        // any delayed re-injection (FLA library uses setTimeout internally)
        const doSweep = () => {
          if (cancelled) return;
          removeDemoBadge();
        };
        doSweep();
        [500, 1000, 2000, 3500, 5000].forEach((ms) => {
          setTimeout(doSweep, ms);
        });
      }
    }

    window.addEventListener("message", handleMessage);

    (async () => {
      try {
        const res = await fetch("/api/facts");
        if (cancelled) return;
        const facts: Array<{ mapRegions?: string[] }> = await res.json();
        if (cancelled) return;

        const seen = new Set<string>();
        const assignedCountries: string[] = [];
        for (const fact of facts) {
          if (Array.isArray(fact.mapRegions)) {
            for (const r of fact.mapRegions) {
              if (r && !seen.has(r)) {
                seen.add(r);
                assignedCountries.push(r);
              }
            }
          }
        }

        assignedCountriesRef.current = assignedCountries;
        trySendColors();
      } catch (err) {
        console.error("WorldMapPlaceholder: fetch failed", err);
      }
    })();

    return () => {
      cancelled = true;
      window.removeEventListener("message", handleMessage);
      mapReadyRef.current = false;
      assignedCountriesRef.current = null;
    };
  }, []);

  return (
    <div data-testid="world-map-container" className="world-map-wrapper">
      <iframe
        ref={iframeRef}
        src="/map/frame.html"
        style={{ width: "100%", height: "400px", border: "none", display: "block" }}
        title="World Map"
      />
    </div>
  );
}
