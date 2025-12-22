import { CATEGORIES } from "@shared/categories";
import "./HomepageCategoryNav.css";

export function HomepageCategoryNav() {
  return (
    <nav className="homepage-category-nav" data-testid="homepage-category-nav">
      <div className="homepage-category-nav-container">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          
          return (
            <a 
              key={category.name}
              href={category.path}
              className="homepage-category-tile"
              style={{ backgroundColor: category.color } as React.CSSProperties}
              data-testid={`link-homepage-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon 
                size={16} 
                strokeWidth={2.5}
                className="homepage-category-icon"
              />
              <span className="homepage-category-name">{category.name}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
