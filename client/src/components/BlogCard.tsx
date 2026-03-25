import { ExternalLink, CircleDollarSign } from 'lucide-react';
import { Link } from 'wouter';
import './BlogCard.css';

interface BlogCardProps {
  id: string;
  image: string;
  date: string;
  category: string;
  title: string;
  summary: string;
  tags: string[];
  isExternal?: boolean;
  externalUrl?: string | null;
  publicationName?: string | null;
  isPaywalled?: boolean;
  originalPublishedAt?: string | null;
}

export default function BlogCard({
  id,
  image,
  date,
  category,
  title,
  summary,
  tags,
  isExternal = false,
  externalUrl,
  publicationName,
  isPaywalled = false,
  originalPublishedAt,
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
        {tags.length > 0 && (
          <div className="blog-card-image-tags">
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
            {category}
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

        {isExternal && originalPublishedAt && (
          <div className="blog-card-tags" data-testid={`text-original-date-${id}`}>
            Originally published on {originalPublishedAt}
          </div>
        )}
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
