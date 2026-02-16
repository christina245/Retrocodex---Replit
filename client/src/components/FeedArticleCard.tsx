import { Link } from "wouter";
import { MessageSquare, Bookmark, Share2 } from "lucide-react";
import CategoryChips from "@/components/CategoryChips";
import "./FeedArticleCard.css";

interface FeedArticleCardProps {
  title: string;
  summary: string;
  coverImage: string;
  category: string;
  slug: string;
}

export default function FeedArticleCard({
  title,
  summary,
  coverImage,
  category,
  slug,
}: FeedArticleCardProps) {
  return (
    <div className="feed-article-card" data-testid="feed-article-card">
      <Link href={`/articles/${slug}`} className="feed-article-link" data-testid={`link-article-${slug}`}>
        <div className="feed-article-main">
          <div className="feed-article-text">
            <h3 className="feed-article-title" data-testid="feed-article-title">{title}</h3>
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
      </Link>
      <div className="feed-article-footer" data-testid="feed-article-footer">
        <div className="feed-article-category" onClick={(e) => e.stopPropagation()}>
          <CategoryChips categories={[category]} />
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
