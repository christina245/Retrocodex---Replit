import { Link } from "wouter";
import { MessageSquare, Bookmark, Share2 } from "lucide-react";
import "./FeedArticleCard.css";

interface FeedArticleCardProps {
  title: string;
  summary: string;
  coverImage: string;
  category: string;
  slug: string;
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

export default function FeedArticleCard({
  title,
  summary,
  coverImage,
  category,
  slug,
}: FeedArticleCardProps) {
  const upperCategory = category.toUpperCase();
  const chipColor = categoryColors[upperCategory] || "#2C2C2C";
  const chipRoute = categoryRoutes[upperCategory] || "/";

  return (
    <div className="feed-article-card" data-testid="feed-article-card">
      <div className="feed-article-main">
        <div className="feed-article-text">
          <Link href={`/articles/${slug}`} className="feed-article-title-link" data-testid={`link-article-${slug}`}>
            <h3 className="feed-article-title" data-testid="feed-article-title">{title}</h3>
          </Link>
          <p className="feed-article-summary" data-testid="feed-article-summary">{summary}</p>
        </div>
        <div className="feed-article-cover-container">
          <img
            src={coverImage}
            alt={title}
            className="feed-article-cover"
            data-testid="feed-article-cover"
          />
        </div>
      </div>
      <div className="feed-article-footer" data-testid="feed-article-footer">
        <div className="feed-article-category" onClick={(e) => e.stopPropagation()}>
          <Link
            href={chipRoute}
            className="feed-article-category-chip"
            style={{ backgroundColor: chipColor }}
            data-testid={`link-category-${category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}`}
          >
            {upperCategory}
          </Link>
        </div>
        <div className="feed-article-actions" data-testid="feed-article-actions">
          <button className="comment-action disabled-action" data-testid="button-article-comment">
            <MessageSquare size={14} />
            <span>Comment</span>
          </button>
          <button className="comment-action disabled-action" data-testid="button-article-save">
            <Bookmark size={14} />
            <span>Save</span>
          </button>
          <button className="comment-action disabled-action" data-testid="button-article-share">
            <Share2 size={14} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
