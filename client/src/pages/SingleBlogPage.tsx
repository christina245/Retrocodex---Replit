import { useState, useRef } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, 
  Tag, 
  Scroll, 
  Home, 
  HeartPulse, 
  Users, 
  Dna, 
  User,
  HelpCircle,
  MessageCircle,
  Bookmark,
  Share2,
  LucideIcon
} from "lucide-react";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { Footer } from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { SaveModal } from "@/components/SaveModal";
import { CommentModal } from "@/components/CommentModal";
import { ArticleShareModal } from "@/components/ArticleShareModal";
import { BeehiivBanner } from "@/components/BeehiivBanner";
import { BlogPost } from "@shared/schema";
import adminAvatar from "@assets/favicon_round_1764970500110.png";
import "./SingleBlogPage.css";

const getCategoryIcon = (category: string): LucideIcon => {
  switch (category) {
    case "History": return Scroll;
    case "Life Sciences": return Dna;
    case "Everyday Life": return Home;
    case "Health & Fitness": return HeartPulse;
    case "Social Sciences": return Users;
    case "Gender & Sexuality": return User;
    default: return HelpCircle;
  }
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case "History": return "#2C2C2C";
    case "Life Sciences": return "#4CAF50";
    case "Everyday Life": return "#795548";
    case "Health & Fitness": return "#E91E63";
    case "Social Sciences": return "#2196F3";
    case "Gender & Sexuality": return "#9C27B0";
    default: return "#878787";
  }
};

export default function SingleBlogPage() {
  const { slug } = useParams<{ slug: string }>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog-posts", slug],
    enabled: !!slug,
  });

  const { data: allPosts } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts/published"],
  });

  const handleSaveEmail = async (email: string) => {
    await fetch("/api/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "save-modal" }),
    });
  };

  const scrollToComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getRelatedArticles = (): BlogPost[] => {
    if (!post || !allPosts) return [];
    
    if (post.relatedManualIds && post.relatedManualIds.length > 0) {
      const manualPosts = post.relatedManualIds
        .map(id => allPosts.find(p => p.id === id))
        .filter((p): p is BlogPost => p !== undefined && p.published === true);
      
      if (manualPosts.length > 0) return manualPosts.slice(0, 4);
    }
    
    const autoRelated = allPosts
      .filter(p => p.id !== post.id && p.published === true)
      .map(p => {
        let score = 0;
        if (p.category === post.category) score += 2;
        const sharedTags = (p.tags || []).filter(tag => (post.tags || []).includes(tag));
        score += sharedTags.length;
        return { post: p, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(item => item.post);
    
    return autoRelated;
  };

  const relatedArticles = getRelatedArticles();
  
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="single-blog-page">
        <Header onMenuClick={() => setIsMenuOpen(true)} />
        <main className="single-blog-main">
          <div className="loading-container">
            <p>Loading article...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="single-blog-page">
        <Header onMenuClick={() => setIsMenuOpen(true)} />
        <main className="single-blog-main">
          <div className="error-container">
            <h1>Article Not Found</h1>
            <p>The article you're looking for doesn't exist or has been removed.</p>
            <Link href="/articles" className="back-link">
              Back to Articles
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(post.category);
  const categoryColor = getCategoryColor(post.category);

  return (
    <div className="single-blog-page">
      <div className="sticky-header-wrapper">
        <Header onMenuClick={() => setIsMenuOpen(true)} />
      </div>
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <article className="single-blog-main">
        <div className="article-hero-section">
          <div className="article-title-container">
            <h1 className="article-title" data-testid="text-title">{post.title}</h1>
          </div>

          {post.coverImage && (
            <div className="article-image-wrapper">
              <div className="article-image-container">
                <img 
                  src={post.coverImage} 
                  alt={post.title} 
                  className="article-hero-image"
                  data-testid="img-hero"
                />
              </div>
              {post.coverImageCaption && (
                <p className="article-image-caption">{post.coverImageCaption}</p>
              )}
            </div>
          )}
          
          <div className="article-meta-row">
            <div className="article-date-author">
              <span className="article-date" data-testid="text-date">
                <Calendar size={14} />
                {formatDate(post.publishedAt)}
              </span>
              <span className="article-author" data-testid="text-author">
                <img 
                  src={post.authorPhoto || adminAvatar} 
                  alt={post.authorName || "Retrocodex Admin"} 
                  className="article-author-avatar"
                />
                {post.authorLink ? (
                  <a 
                    href={post.authorLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="article-author-link"
                  >
                    {post.authorName || "Retrocodex Admin"}
                  </a>
                ) : (
                  post.authorName || "Retrocodex Admin"
                )}
              </span>
            </div>
            <div className="article-actions">
              <button 
                className="article-action-button"
                onClick={scrollToComments}
                data-testid="button-comment-article"
              >
                <MessageCircle size={16} />
                <span>0 comments</span>
              </button>
              <button 
                className="article-action-button"
                onClick={() => setIsSaveModalOpen(true)}
                data-testid="button-save-article"
              >
                <Bookmark size={16} />
                <span>Save</span>
              </button>
              <button 
                className="article-action-button"
                onClick={() => setIsShareModalOpen(true)}
                data-testid="button-share-article"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        <div className="content-layout">
          <div className="article-content">
            <div 
              className="blog-body"
              dangerouslySetInnerHTML={{ __html: post.contentHtml || "" }}
              data-testid="content-body"
            />

            <div className="comments-section" ref={commentsRef}>
              <h3 className="comments-heading">Comments</h3>
              <div className="comments-placeholder">
                <MessageCircle size={32} />
                <p className="comments-unavailable-text">
                  Commenting is currently unavailable in beta mode. We're working on it!
                </p>
                <p className="comments-redirect-text">
                  If you'd like to share your thoughts, head over to our{" "}
                  <a 
                    href="http://reddit.com/r/LearnedWrong" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="comments-reddit-link"
                  >
                    Reddit community
                  </a>
                </p>
              </div>
            </div>
          </div>

          <aside className="article-sidebar">
            <div className="sidebar-section">
              <h3 className="sidebar-heading">Category</h3>
              <Link 
                href={`/articles?category=${encodeURIComponent(post.category)}`}
                className="sidebar-category-link"
                data-testid="link-category"
              >
                <CategoryIcon size={16} style={{ color: categoryColor }} />
                <span className="sidebar-category-text">{post.category.toUpperCase()}</span>
              </Link>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="sidebar-section">
                <h3 className="sidebar-heading">Tags</h3>
                <div className="sidebar-tags">
                  {post.tags.map(tag => (
                    <span key={tag} className="sidebar-tag" data-testid={`tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}>
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="sidebar-section beehiiv-section">
              <h3 className="sidebar-heading">Subscribe</h3>
              <BeehiivBanner />
            </div>
          </aside>
        </div>

        {relatedArticles.length > 0 && (
          <section className="related-articles">
            <h2 className="related-heading">Related Articles</h2>
            <div className="related-grid">
              {relatedArticles.map(article => (
                <BlogCard
                  key={article.id}
                  id={article.slug}
                  image={article.coverImage || ""}
                  date={formatDate(article.publishedAt)}
                  category={article.category}
                  categoryIcon={getCategoryIcon(article.category)}
                  categoryColor={getCategoryColor(article.category)}
                  title={article.title}
                  summary={article.summary}
                  tags={article.tags || []}
                />
              ))}
            </div>
          </section>
        )}
      </article>

      <Footer />

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSubmit={handleSaveEmail}
      />

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
      />

      <ArticleShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        article={post ? {
          slug: post.slug,
          title: post.title,
          summary: post.summary,
          coverImage: post.coverImage
        } : null}
      />
    </div>
  );
}
