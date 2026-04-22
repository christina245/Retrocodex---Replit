import { Link } from "wouter";
import "./CategoryLinks.css";

interface CategoryLinksProps {
  categories: string[];
}

const categoryColors: Record<string, string> = {
  "HISTORY": "#D29E00",
  "LIFE SCIENCES": "#419F36",
  "HEALTH & FITNESS": "#EC7200",
  "SOCIAL SCIENCES": "#9D0085",
  "GENDER & SEXUALITY": "#FF6F98",
  "EVERYDAY LIFE": "#0167A2",
};

const categoryRoutes: Record<string, string> = {
  "HISTORY": "/category/history",
  "LIFE SCIENCES": "/category/life-sciences",
  "HEALTH & FITNESS": "/category/health-fitness",
  "SOCIAL SCIENCES": "/category/social-sciences",
  "GENDER & SEXUALITY": "/category/gender-sexuality",
  "EVERYDAY LIFE": "/category/everyday-life",
};

const mainCategories = ["HISTORY", "LIFE SCIENCES", "HEALTH & FITNESS", "SOCIAL SCIENCES", "GENDER & SEXUALITY", "EVERYDAY LIFE"];

export function CategoryLinks({ categories }: CategoryLinksProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  const filteredCategories = categories.filter(cat => 
    mainCategories.includes(cat.toUpperCase())
  );

  if (filteredCategories.length === 0) {
    return null;
  }

  return (
    <div className="category-links" data-testid="category-links">
      <h3 className="category-links-header">VIEW ALL OTHER TOPICS IN</h3>
      <div className="category-links-list">
        {filteredCategories.map((category, index) => {
          const upperCategory = category.toUpperCase();
          const color = categoryColors[upperCategory] || "#2C2C2C";
          const route = categoryRoutes[upperCategory] || "/";
          return (
            <Link
              key={index}
              href={route}
              className="category-link-chip"
              style={{ backgroundColor: color }}
              data-testid={`category-link-${category.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => window.scrollTo(0, 0)}
            >
              {upperCategory}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryLinks;
