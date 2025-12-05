import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BlogPost } from "@shared/schema";
import thanksgivingPhoto from "@assets/thanksgiving myths stock photo_1763852604175.jpg";
import "./HeroSection.css";

export function HeroSection() {
  const { data: featuredPosts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts/featured"],
  });

  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}. ${day}, ${year}`;
  };

  const featuredPost = featuredPosts && featuredPosts.length > 0 ? featuredPosts[0] : null;

  if (isLoading) {
    return (
      <section className="hero-section">
        <div className="hero-container" data-testid="hero-container">
          <div className="hero-loading">Loading featured article...</div>
        </div>
      </section>
    );
  }

  if (featuredPost) {
    return (
      <section className="hero-section">
        <div className="hero-container" data-testid="hero-container">
          <div className="hero-content">
            <div className="hero-tag">
              <div className="hero-tag-line"></div>
              <span className="hero-tag-text">ARTICLE</span>
            </div>
            
            <Link
              href={`/articles/${featuredPost.slug}`}
              className="hero-link"
              data-testid="link-hero-article"
            >
              <h2 className="hero-title" data-testid="text-hero-title">
                {featuredPost.title}
              </h2>
            </Link>
            
            <p className="hero-summary" data-testid="text-hero-summary">
              {featuredPost.summary}
            </p>
            
            {featuredPost.publishedAt && (
              <div className="hero-date" data-testid="text-hero-date">
                {formatDate(featuredPost.publishedAt)}
              </div>
            )}
          </div>
          
          <div className="hero-image-container">
            <Link
              href={`/articles/${featuredPost.slug}`}
              className="hero-image-link"
              data-testid="link-hero-image"
            >
              <img 
                src={featuredPost.coverImage || thanksgivingPhoto} 
                alt={featuredPost.title} 
                className="hero-image"
              />
            </Link>
            {featuredPost.coverImageCaption && (
              <div className="hero-attribution" data-testid="text-hero-attribution">
                {featuredPost.coverImageCaption}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-section">
      <div className="hero-container" data-testid="hero-container">
        <div className="hero-content">
          <div className="hero-tag">
            <div className="hero-tag-line"></div>
            <span className="hero-tag-text">ARTICLE</span>
          </div>
          
          <a 
            href="#" 
            className="hero-link"
            data-testid="link-hero-article"
          >
            <h2 className="hero-title" data-testid="text-hero-title">
              5 Misconceptions You Might Have About Thanksgiving
            </h2>
          </a>
          
          <p className="hero-summary" data-testid="text-hero-summary">
            Did you know that turkey might not have been served at the legendary 1621 "first Thanksgiving meal"? Let's take a closer look at the real history behind the iconic American holiday, from the troubled relationship between the Native Americans and Pilgrims to what the Pilgrims actually wore.
          </p>
          
          <div className="hero-date" data-testid="text-hero-date">{formatDate(null)}</div>
        </div>
        
        <div className="hero-image-container">
          <a 
            href="#" 
            className="hero-image-link"
            data-testid="link-hero-image"
          >
            <img 
              src={thanksgivingPhoto} 
              alt="Thanksgiving dinner spread" 
              className="hero-image"
            />
          </a>
          <div className="hero-attribution" data-testid="text-hero-attribution">Photo by Megan Watson on Unsplash</div>
        </div>
      </div>
    </section>
  );
}
