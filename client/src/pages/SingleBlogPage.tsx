import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  Folder, 
  Scroll, 
  Home, 
  HeartPulse, 
  Users, 
  Dna, 
  User,
  HelpCircle,
  LucideIcon
} from "lucide-react";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { Footer } from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
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
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog-posts", slug],
    enabled: !!slug,
  });

  const { data: allPosts } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts/published"],
  });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    setNewsletterStatus("loading");
    try {
      const response = await fetch("/api/newsletter-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail, source: "blog-sidebar" }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to subscribe");
      }
      
      setNewsletterStatus("success");
      setNewsletterEmail("");
    } catch {
      setNewsletterStatus("error");
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
              <ArrowLeft size={18} />
              Back to Articles
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="single-blog-page">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <article className="single-blog-main">
        <div className="hero-section">
          {post.coverImage && (
            <div className="hero-image-container">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="hero-image"
                data-testid="img-hero"
              />
              {post.coverImageCaption && (
                <p className="hero-caption">{post.coverImageCaption}</p>
              )}
            </div>
          )}
          
          <div className="hero-title-container">
            <h1 className="hero-title" data-testid="text-title">{post.title}</h1>
            <div className="hero-meta">
              <span className="hero-date" data-testid="text-date">
                <Calendar size={14} />
                {formatDate(post.publishedAt)}
              </span>
              <span className="hero-author" data-testid="text-author">
                <img 
                  src={post.authorPhoto || adminAvatar} 
                  alt={post.authorName || "Retrocodex Admin"} 
                  className="hero-author-avatar"
                />
                {post.authorLink ? (
                  <a 
                    href={post.authorLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hero-author-link"
                  >
                    {post.authorName || "Retrocodex Admin"}
                  </a>
                ) : (
                  post.authorName || "Retrocodex Admin"
                )}
              </span>
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
          </div>

          <aside className="article-sidebar">
            <div className="sidebar-section">
              <h3 className="sidebar-heading">Category</h3>
              <Link 
                href={`/articles?category=${encodeURIComponent(post.category)}`}
                className="sidebar-category-link"
                data-testid="link-category"
              >
                <Folder size={16} />
                {post.category}
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

            <div className="sidebar-section newsletter-section">
              <h3 className="sidebar-heading">Subscribe to Newsletter</h3>
              <p className="newsletter-description">
                Get the latest articles and fact-checks delivered to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email address"
                  className="newsletter-input"
                  disabled={newsletterStatus === "loading" || newsletterStatus === "success"}
                  data-testid="input-newsletter-email"
                />
                <button 
                  type="submit" 
                  className="newsletter-button"
                  disabled={newsletterStatus === "loading" || newsletterStatus === "success"}
                  data-testid="button-subscribe"
                >
                  {newsletterStatus === "loading" ? "..." : 
                   newsletterStatus === "success" ? "Subscribed!" : "Subscribe"}
                </button>
              </form>
              {newsletterStatus === "error" && (
                <p className="newsletter-error">Failed to subscribe. Please try again.</p>
              )}
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
    </div>
  );
}
