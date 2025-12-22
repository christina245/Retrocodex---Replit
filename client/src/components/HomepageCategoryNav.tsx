import { CATEGORIES } from "@shared/categories";
import "./HomepageCategoryNav.css";

interface HomepageCategoryNavProps {
  activeCategory?: string;
  sticky?: boolean;
}

export function HomepageCategoryNav({ activeCategory, sticky = false }: HomepageCategoryNavProps) {
  const navClassName = sticky 
    ? "homepage-category-nav homepage-category-nav-sticky" 
    : "homepage-category-nav";

  return (
    <nav className={navClassName} data-testid="homepage-category-nav">
      <div className="homepage-category-nav-container">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory?.toLowerCase() === category.name.toLowerCase();
          const isInactive = activeCategory && !isActive;
          
          return (
            <a 
              key={category.name}
              href={category.path}
              className={`homepage-category-tile ${isActive ? 'homepage-category-tile-active' : ''} ${isInactive ? 'homepage-category-tile-inactive' : ''}`}
              style={{ 
                '--category-color': category.color,
                backgroundColor: isInactive ? '#878787' : category.color 
              } as React.CSSProperties}
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
