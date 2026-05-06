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

    function handleMessage(e: MessageEvent) {
      if (!e.data || cancelled) return;

      if (e.data.type === "fla-click" && e.data.name) {
        onRegionClickRef.current({
          name: e.data.name,
          isCountry: !!e.data.isCountry,
        });
      }

      if (e.data.type === "fla-ready") {
        mapReadyRef.current = true;
        trySendColors();
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
