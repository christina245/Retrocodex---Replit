/// <reference types="../types/fla-map" />
import { useEffect, useRef } from "react";

interface WorldMapPlaceholderProps {
  onRegionClick: (region: { name: string; isCountry: boolean }) => void;
}

const CONTAINER_ID = "fla-world-map-container";

function appendScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

let scriptsPromise: Promise<void> | null = null;

function ensureScriptsLoaded(): Promise<void> {
  if (!scriptsPromise) {
    scriptsPromise = (async () => {
      if (!document.querySelector('link[href="/map/map.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "/map/map.css";
        document.head.appendChild(link);
      }
      await appendScript("/map/raphael.min.js");
      await appendScript("/map/map.js");
      await appendScript("/map/settings.js");
      await appendScript("/map/paths.js");
    })();
  }
  return scriptsPromise;
}

export function WorldMapPlaceholder({ onRegionClick }: WorldMapPlaceholderProps) {
  const onRegionClickRef = useRef(onRegionClick);
  onRegionClickRef.current = onRegionClick;

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [, factsRes] = await Promise.all([
          ensureScriptsLoaded(),
          fetch("/api/facts"),
        ]);

        if (cancelled) return;

        const facts: Array<{ mapRegions?: string[] }> = await factsRes.json();
        if (cancelled) return;

        const assignedCountries = new Set<string>();
        for (const fact of facts) {
          if (Array.isArray(fact.mapRegions)) {
            for (const r of fact.mapRegions) {
              if (r) assignedCountries.add(r);
            }
          }
        }

        const cfg = window.map_cfg;
        if (!cfg?.map_data) {
          console.error("WorldMapPlaceholder: window.map_cfg not set after scripts loaded");
          return;
        }

        for (const sid of Object.keys(cfg.map_data)) {
          const entry = cfg.map_data[sid];
          const hasData = assignedCountries.has(entry.name);
          entry.color = hasData ? "#FF5353" : "#878787";
          entry.colorOver = hasData ? "#FF5353" : "#878787";
        }

        cfg.isNewWindow = false;
        cfg.iPhoneLink = false;

        if (cancelled) return;

        const container = document.getElementById(CONTAINER_ID);
        if (!container) return;
        container.innerHTML = "";

        const map = new window.FlaMap(cfg);

        map.drawOnDomReady(CONTAINER_ID, () => {
          if (cancelled) return;
          map.on("click", (_ev, sid) => {
            const entry = cfg.map_data[sid];
            if (entry?.name) {
              onRegionClickRef.current({ name: entry.name, isCountry: true });
            }
          });
        });

        // drawOnDomReady registers an internal DOMContentLoaded / load listener.
        // In a React SPA those events have already fired, so new listeners will
        // never be called organically. Dispatch synthetic events immediately
        // after registration to fire the pending handler.
        document.dispatchEvent(new Event("DOMContentLoaded"));
        window.dispatchEvent(new Event("load"));
      } catch (err) {
        console.error("WorldMapPlaceholder: init failed", err);
      }
    }

    init();

    return () => {
      cancelled = true;
      const container = document.getElementById(CONTAINER_ID);
      if (container) container.innerHTML = "";
    };
  }, []);

  return (
    <div data-testid="world-map-container" className="world-map-wrapper">
      <div id={CONTAINER_ID} />
    </div>
  );
}
