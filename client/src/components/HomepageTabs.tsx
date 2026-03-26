import { useState } from "react";
import "./HomepageTabs.css";

export type HomepageTabType = "explore" | "new" | "popular" | "current-events" | "debated" | "regionally-taught";

interface HomepageTabsProps {
  activeTab: HomepageTabType;
  onTabChange: (tab: HomepageTabType) => void;
}

const TABS: { id: HomepageTabType; label: string; tooltip?: string }[] = [
  { id: "explore", label: "Featured" },
  { id: "new", label: "New" },
  { id: "popular", label: "Popular", tooltip: "Topics frequently reported and upvoted by social media users." },
  { id: "current-events", label: "Current Events", tooltip: "Topics relevant to misinformation spreading through current social media and news media." },
  { id: "debated", label: "Debated", tooltip: "Topics with relatively weaker consensus." },
  { id: "regionally-taught", label: "Regionally Taught", tooltip: "Topics mostly taught outside of the United States or within specific parts of it." },
];

export function HomepageTabs({ activeTab, onTabChange }: HomepageTabsProps) {
  const [hoveredTab, setHoveredTab] = useState<HomepageTabType | null>(null);

  return (
    <div className="homepage-tabs-wrapper">
      <nav className="homepage-tabs" data-testid="homepage-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`homepage-tab ${activeTab === tab.id ? "homepage-tab-active" : ""}`}
            onClick={() => onTabChange(tab.id)}
            onMouseEnter={() => tab.tooltip && setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            data-testid={`button-tab-${tab.id}`}
          >
            <span className="homepage-tab-text">{tab.label}</span>
            {activeTab === tab.id && <div className="homepage-tab-indicator" />}
            {tab.tooltip && hoveredTab === tab.id && (
              <div className="homepage-tab-tooltip" data-testid={`tooltip-tab-${tab.id}`}>
                {tab.tooltip}
              </div>
            )}
          </button>
        ))}
      </nav>
      <div className="homepage-tabs-divider" />
    </div>
  );
}
