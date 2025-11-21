import { Scroll, Dna, Home, Dumbbell, Users, Heart, Zap } from "lucide-react";
import "./CategoryNav.css";

const categories = [
  { name: "HISTORY", icon: Scroll, color: "#F5D547", path: "/category/history" },
  { name: "LIFE SCIENCES", icon: Dna, color: "#6FCF97", path: "/category/life-sciences" },
  { name: "EVERYDAY LIFE", icon: Home, color: "#9B51E0", path: "/category/everyday-life" },
  { name: "HEALTH & FITNESS", icon: Dumbbell, color: "#F2994A", path: "/category/health-fitness" },
  { name: "SOCIAL SCIENCES", icon: Users, color: "#EB5757", path: "/category/social-sciences" },
  { name: "GENDER & SEXUALITY", icon: Heart, color: "#E91E63", path: "/category/gender-sexuality" },
  { name: "OTHER", icon: Zap, color: "#2C2C2C", path: "/category/other" },
];

export function CategoryNav() {
  return (
    <nav className="category-nav">
      <div className="category-nav-container">
        {categories.map((category) => {
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
