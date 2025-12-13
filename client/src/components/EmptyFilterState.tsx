import noFactsImage from "@assets/No_facts_found_(yet)._1765617294608.png";
import "./EmptyFilterState.css";

export function EmptyFilterState() {
  return (
    <div className="empty-filter-state" data-testid="empty-filter-state">
      <img 
        src={noFactsImage} 
        alt="No facts found (yet)" 
        className="empty-filter-state-image"
      />
    </div>
  );
}
