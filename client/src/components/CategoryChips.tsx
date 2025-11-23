import { ChevronLeft } from "lucide-react";
import { 
  FaBookOpen, 
  FaFlask, 
  FaHome, 
  FaHeartbeat, 
  FaUsers, 
  FaVenusMars, 
  FaEllipsisH 
} from "react-icons/fa";
import "./CategoryChips.css";

interface CategoryChipsProps {
  categories: string[];
}

const categoryIcons: Record<string, any> = {
  "History": FaBookOpen,
  "Life Sciences": FaFlask,
  "Everyday Life": FaHome,
  "Health & Fitness": FaHeartbeat,
  "Social Sciences": FaUsers,
  "Gender & Sexuality": FaVenusMars,
  "Other": FaEllipsisH,
};

export default function CategoryChips({ categories }: CategoryChipsProps) {
  return (
    <div className="category-chips" data-testid="category-chips">
      <ChevronLeft className="red-triangle" size={16} />
      
      {categories.map((category, index) => {
        const Icon = categoryIcons[category] || FaEllipsisH;
        
        return (
          <div key={category} className="category-chip-group">
            <div className="category-chip">
              <Icon className="category-icon" />
              <span className="category-text">{category.toUpperCase()}</span>
            </div>
            {index < categories.length - 1 && <span className="dot-separator">•</span>}
          </div>
        );
      })}
    </div>
  );
}
