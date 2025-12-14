import noFactsImage from "@assets/No articles found (yet) longpng.png";
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
