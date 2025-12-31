import "./HomepageTabs.css";

export type HomepageTabType = "explore" | "new" | "popular" | "trending" | "debated" | "regionally-taught";

interface HomepageTabsProps {
  activeTab: HomepageTabType;
  onTabChange: (tab: HomepageTabType) => void;
}

const TABS: { id: HomepageTabType; label: string }[] = [
  { id: "explore", label: "Featured" },
  { id: "new", label: "New" },
  { id: "popular", label: "Popular" },
  { id: "trending", label: "Trending" },
  { id: "debated", label: "Debated" },
  { id: "regionally-taught", label: "Regionally Taught" },
];

export function HomepageTabs({ activeTab, onTabChange }: HomepageTabsProps) {
  return (
    <div className="homepage-tabs-wrapper">
      <nav className="homepage-tabs" data-testid="homepage-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`homepage-tab ${activeTab === tab.id ? "homepage-tab-active" : ""}`}
            onClick={() => onTabChange(tab.id)}
            data-testid={`button-tab-${tab.id}`}
          >
            <span className="homepage-tab-text">{tab.label}</span>
            {activeTab === tab.id && <div className="homepage-tab-indicator" />}
          </button>
        ))}
      </nav>
      <div className="homepage-tabs-divider" />
    </div>
  );
}
