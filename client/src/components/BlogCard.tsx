import { LucideIcon } from 'lucide-react';
import './BlogCard.css';

interface BlogCardProps {
  id: string;
  image: string;
  date: string;
  category: string;
  categoryIcon: LucideIcon;
  categoryColor: string;
  title: string;
  summary: string;
  tags: string[];
}

export default function BlogCard({
  id,
  image,
  date,
  category,
  categoryIcon: CategoryIcon,
  categoryColor,
  title,
  summary,
  tags
}: BlogCardProps) {
  return (
    <article className="blog-card" data-testid={`blog-card-${id}`}>
      <div className="blog-card-image-container">
        <img 
          src={image} 
          alt={title}
          className="blog-card-image"
          data-testid={`blog-card-image-${id}`}
        />
      </div>
      
      <div className="blog-card-content">
        <div className="blog-card-meta">
          <span className="blog-card-date" data-testid={`blog-card-date-${id}`}>
            {date}
          </span>
          <span 
            className="blog-card-category"
            style={{ color: categoryColor }}
            data-testid={`blog-card-category-${id}`}
          >
            <CategoryIcon size={14} style={{ color: categoryColor }} />
            {category}
          </span>
        </div>
        
        <h3 className="blog-card-title" data-testid={`blog-card-title-${id}`}>
          {title}
        </h3>
        
        <p className="blog-card-summary" data-testid={`blog-card-summary-${id}`}>
          {summary}
        </p>
        
        <div className="blog-card-tags">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="blog-card-tag"
              data-testid={`blog-card-tag-${id}-${index}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
