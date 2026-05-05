import { useEffect, useRef } from "react";

interface FlaMapEntry {
  name: string;
  shortname: string;
  comment: string;
  link: string | null;
  color: string | null;
  colorOver: string | null;
  nameColor?: string | null;
  nameColorOver?: string | null;
  nameFontSize?: string | null;
  isNewWindow?: boolean | null;
}

interface FlaMapConfig {
  mapWidth: string | number;
  mapHeight: number;
  isNewWindow: boolean;
  iPhoneLink: boolean;
  borderColor: string;
  borderColorOver: string;
  map_data: Record<string, FlaMapEntry>;
  [key: string]: unknown;
}

interface FlaMapInstance {
  drawOnDomReady(containerId: string, callback?: () => void): void;
  on(
    event: "click" | "dblclick" | "mousein" | "mouseout" | "mousemove" | "mousedown" | "mouseup",
    callback: (ev: MouseEvent, sid: string, map: FlaMapInstance) => void
  ): void;
  fetchStateAttr(sid: string, attr: string): unknown;
  setStateAttr(sid: string, cfg: Partial<FlaMapEntry>): void;
  mapConfig: FlaMapConfig;
}

declare global {
  interface Window {
    map_cfg: FlaMapConfig;
    FlaMap: new (cfg: FlaMapConfig) => FlaMapInstance;
  }
}

interface WorldMapPlaceholderProps {
  onRegionClick: (region: { name: string; isCountry: boolean }) => void;
}

const CONTAINER_ID = "fla-world-map-container";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export function WorldMapPlaceholder({ onRegionClick }: WorldMapPlaceholderProps) {
  const onRegionClickRef = useRef(onRegionClick);
  onRegionClickRef.current = onRegionClick;

  useEffect(() => {
    let cancelled = false;
    let cssLink: HTMLLinkElement | null = null;

    async function init() {
      try {
        const res = await fetch("/api/facts");
        if (cancelled) return;
        const facts: Array<{ mapRegions?: string[] }> = await res.json();

        const assignedCountries = new Set<string>();
        for (const fact of facts) {
          if (Array.isArray(fact.mapRegions)) {
            for (const r of fact.mapRegions) {
              if (r) assignedCountries.add(r);
            }
          }
        }

        if (cancelled) return;

        if (!document.querySelector('link[href="/map/map.css"]')) {
          cssLink = document.createElement("link");
          cssLink.rel = "stylesheet";
          cssLink.href = "/map/map.css";
          document.head.appendChild(cssLink);
        }

        await loadScript("/map/raphael.min.js");
        await loadScript("/map/settings.js");
        await loadScript("/map/paths.js");
        await loadScript("/map/map.js");

        if (cancelled) return;

        const cfg = window.map_cfg;
        if (!cfg?.map_data) return;

        for (const sid of Object.keys(cfg.map_data)) {
          const entry = cfg.map_data[sid];
          const hasData = assignedCountries.has(entry.name);
          entry.color = hasData ? "#FF5353" : "#878787";
          entry.colorOver = hasData ? "#FF5353" : "#878787";
        }

        cfg.isNewWindow = false;
        cfg.iPhoneLink = false;

        const container = document.getElementById(CONTAINER_ID);
        if (!container || cancelled) return;
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
      } catch (err) {
        console.error("WorldMapPlaceholder: init failed", err);
      }
    }

    init();

    return () => {
      cancelled = true;
      const container = document.getElementById(CONTAINER_ID);
      if (container) container.innerHTML = "";
      if (cssLink && cssLink.parentNode) cssLink.parentNode.removeChild(cssLink);
    };
  }, []);

  return (
    <div
      data-testid="world-map-container"
      className="world-map-wrapper"
    >
      <div id={CONTAINER_ID} />
    </div>
  );
}
