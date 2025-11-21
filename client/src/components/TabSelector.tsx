import "./TabSelector.css";

interface TabSelectorProps {
  activeTab: "featured" | "recent";
  onTabChange: (tab: "featured" | "recent") => void;
}

export function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  return (
    <div className="tab-selector">
      <button
        className={`tab-button ${activeTab === "featured" ? "active" : ""}`}
        onClick={() => onTabChange("featured")}
        data-testid="button-tab-featured"
      >
        Featured facts
      </button>
      <button
        className={`tab-button ${activeTab === "recent" ? "active" : ""}`}
        onClick={() => onTabChange("recent")}
        data-testid="button-tab-recent"
      >
        Recently added
      </button>
    </div>
  );
}
