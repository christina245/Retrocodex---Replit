import { CATEGORIES } from "@shared/categories";
import "./CategoryNav.css";

interface CategoryNavProps {
  selectedCategory?: string;
}

export function CategoryNav({ selectedCategory }: CategoryNavProps) {
  return (
    <nav className="category-nav">
      <div className="category-nav-container">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory?.toLowerCase() === category.name.toLowerCase();
          const isOther = category.name === "OTHER";
          
          return (
            <a 
              key={category.name}
              href={category.path}
              className={`category-item ${isSelected ? 'category-item-selected' : ''}`}
              style={{ '--category-color': category.color } as React.CSSProperties}
              data-testid={`link-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon 
                size={20} 
                className="category-icon" 
                style={{ color: isSelected && isOther ? 'white' : category.color }} 
              />
              <span className="category-name">{category.name}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
