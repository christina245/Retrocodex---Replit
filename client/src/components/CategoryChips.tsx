import { Link } from "wouter";
import { getCategoryConfig } from "@shared/categories";
import { Zap } from "lucide-react";
import "./CategoryChips.css";

interface CategoryChipsProps {
  categories: string[];
}

export default function CategoryChips({ categories }: CategoryChipsProps) {
  return (
    <div className="category-chips" data-testid="category-chips">
      {categories.map((category, index) => {
        const config = getCategoryConfig(category);
        const Icon = config?.icon || Zap;
        const color = config?.color || "#2C2C2C";
        const path = config?.path || "/";
        
        return (
          <div key={category} className="category-chip-group">
            <Link 
              href={path} 
              className="category-chip category-chip-link"
              data-testid={`link-category-${category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}`}
            >
              <Icon className="category-icon" size={20} style={{ color }} />
              <span className="category-text">{category.toUpperCase()}</span>
            </Link>
            {index < categories.length - 1 && <span className="dot-separator">•</span>}
          </div>
        );
      })}
    </div>
  );
}
