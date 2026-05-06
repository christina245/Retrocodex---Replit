import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const GEO_URL = "/countries-110m.json";

/**
 * Maps database country name → one or more world-atlas feature names so
 * that clicks and highlights resolve correctly regardless of naming differences.
 */
const DB_TO_GEO: Record<string, string[]> = {
  "United States": ["United States of America"],
  "South Korea": ["South Korea"],
  "North Korea": ["North Korea"],
  "Czech Republic": ["Czechia"],
  "Democratic Republic of the Congo": ["Dem. Rep. Congo"],
  "Republic of the Congo": ["Congo"],
  "United Kingdom": ["United Kingdom"],
  "Russia": ["Russia"],
  "Iran": ["Iran"],
  "Syria": ["Syria"],
  "Tanzania": ["Tanzania"],
  "Bolivia": ["Bolivia"],
  "Venezuela": ["Venezuela"],
};

/** Reverse map: geo feature name → canonical DB name used in our system */
function buildReverseMap(): Record<string, string> {
  const rev: Record<string, string> = {};
  for (const [dbName, geoNames] of Object.entries(DB_TO_GEO)) {
    for (const g of geoNames) rev[g.toLowerCase()] = dbName;
  }
  return rev;
}

const GEO_TO_DB = buildReverseMap();

function resolveDbName(geoName: string): string {
  return GEO_TO_DB[geoName.toLowerCase()] ?? geoName;
}

function isHighlightedGeo(geoName: string, highlighted: Set<string>): boolean {
  if (highlighted.has(geoName)) return true;
  const resolved = resolveDbName(geoName);
  if (highlighted.has(resolved)) return true;
  const aliases = DB_TO_GEO[geoName] ?? [];
  return aliases.some((a) => highlighted.has(a));
}

interface TooltipState {
  name: string;
  count: number;
  x: number;
  y: number;
}

interface WorldMapPlaceholderProps {
  onRegionClick: (region: { name: string; isCountry: boolean }) => void;
}

export function WorldMapPlaceholder({ onRegionClick }: WorldMapPlaceholderProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // Same queryKey as HomePage — TanStack Query deduplicates the network
  // request and serves from cache, so this does not cause a duplicate fetch.
  const { data: facts = [] } = useQuery<Array<{ mapRegions?: string[] }>>({
    queryKey: ["/api/facts"],
  });

  const highlighted = useMemo(() => {
    const s = new Set<string>();
    for (const fact of facts) {
      if (Array.isArray(fact.mapRegions)) {
        for (const r of fact.mapRegions) {
          if (r) s.add(r);
        }
      }
    }
    return s;
  }, [facts]);

  const countryFactCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const fact of facts) {
      if (Array.isArray(fact.mapRegions)) {
        for (const r of fact.mapRegions) {
          if (r) counts[r] = (counts[r] ?? 0) + 1;
        }
      }
    }
    return counts;
  }, [facts]);

  function getFactCount(geoName: string): number {
    const dbName = resolveDbName(geoName);
    return countryFactCounts[dbName] ?? countryFactCounts[geoName] ?? 0;
  }

  return (
    <>
      <div className="world-map-clip">
        <div data-testid="world-map-container" className="world-map-wrapper">
          <ComposableMap
            projectionConfig={{ scale: 147, center: [0, 10] }}
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const geoName: string = String(geo.properties.name ?? "");
                  const lit = isHighlightedGeo(geoName, highlighted);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => {
                        onRegionClick({
                          name: resolveDbName(geoName),
                          isCountry: true,
                        });
                      }}
                      onMouseEnter={(evt) => {
                        setTooltip({
                          name: resolveDbName(geoName),
                          count: getFactCount(geoName),
                          x: evt.clientX,
                          y: evt.clientY,
                        });
                      }}
                      onMouseMove={(evt) => {
                        setTooltip((prev) =>
                          prev ? { ...prev, x: evt.clientX, y: evt.clientY } : null
                        );
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        default: {
                          fill: lit ? "#FF5353" : "#878787",
                          stroke: "#ffffff",
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                        hover: {
                          fill: lit ? "#e83d3d" : "#9E9E9E",
                          stroke: "#ffffff",
                          strokeWidth: 0.5,
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: lit ? "#c73030" : "#757575",
                          stroke: "#ffffff",
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>
      </div>

      {tooltip && (
        <div
          className="map-country-tooltip"
          style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
          aria-hidden="true"
        >
          <p className="map-tooltip-name">{tooltip.name}</p>
          <p className="map-tooltip-count">
            {tooltip.count} {tooltip.count === 1 ? "local topic" : "local topics"} submitted
          </p>
        </div>
      )}
    </>
  );
}
