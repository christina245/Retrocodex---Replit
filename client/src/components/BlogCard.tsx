import { LucideIcon, ExternalLink, CircleDollarSign } from 'lucide-react';
import { Link } from 'wouter';
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
  isExternal?: boolean;
  externalUrl?: string | null;
  publicationName?: string | null;
  isPaywalled?: boolean;
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
  tags,
  isExternal = false,
  externalUrl,
  publicationName,
  isPaywalled = false,
}: BlogCardProps) {
  const cardContent = (
    <article className="blog-card" data-testid={`blog-card-${id}`}>
      <div className="blog-card-image-container">
        {image ? (
          <img
            src={image}
            alt={title}
            className="blog-card-image"
            data-testid={`blog-card-image-${id}`}
          />
        ) : (
          <div className="blog-card-image-placeholder" data-testid={`blog-card-image-${id}`} />
        )}
        {isExternal && (
          <div className="blog-card-badges">
            <span
              className="blog-card-badge blog-card-badge--external"
              title={`View article on ${publicationName || 'external site'}`}
              data-testid={`badge-external-${id}`}
            >
              <ExternalLink size={11} />
              {publicationName && <span className="blog-card-badge-text">{publicationName}</span>}
            </span>
            {isPaywalled && (
              <span
                className="blog-card-badge blog-card-badge--paywall"
                title="This article may be behind a paywall"
                data-testid={`badge-paywall-${id}`}
              >
                <CircleDollarSign size={11} />
              </span>
            )}
          </div>
        )}
      </div>

      <div className="blog-card-content">
        <div className="blog-card-meta">
          <span className="blog-card-date" data-testid={`blog-card-date-${id}`}>
            {date}
          </span>
          <span
            className="blog-card-category"
            data-testid={`blog-card-category-${id}`}
          >
            <CategoryIcon size={14} style={{ color: categoryColor }} />
            <span className="blog-card-category-text">{category}</span>
          </span>
        </div>

        <h3 className="blog-card-title" data-testid={`blog-card-title-${id}`}>
          {title}
        </h3>

        {summary && (
          <p className="blog-card-summary" data-testid={`blog-card-summary-${id}`}>
            {summary}
          </p>
        )}

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

  if (isExternal && externalUrl) {
    return (
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="blog-card-link"
        data-testid={`link-blog-card-${id}`}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <Link href={`/articles/${id}`} className="blog-card-link" data-testid={`link-blog-card-${id}`}>
      {cardContent}
    </Link>
  );
}
