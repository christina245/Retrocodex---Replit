import { CATEGORIES } from "@shared/categories";
import "./CategoryNav.css";

export function CategoryNav() {
  return (
    <nav className="category-nav">
      <div className="category-nav-container">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <a 
              key={category.name}
              href={category.path}
              className="category-item"
              style={{ '--category-color': category.color } as React.CSSProperties}
              data-testid={`link-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon size={20} className="category-icon" style={{ color: category.color }} />
              <span className="category-name">{category.name}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
