import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import BlogCard from "@/components/BlogCard";
import workInProgressImage from "@assets/No articles found (yet)._1764112278730.png";
import "./ArticlesPage.css";

interface UnifiedArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImage: string;
  category: string;
  tags: string[];
  createdAt: string | null;
  publishedAt: string | null;
  originalPublishedAt: string | null;
  isExternal: boolean;
  externalUrl: string | null;
  publicationName: string | null;
  isPaywalled: boolean;
}

const CATEGORY_OPTIONS = [
  "All",
  "History",
  "Life Sciences",
  "Everyday Life",
  "Health & Fitness",
  "Social Sciences",
  "Gender & Sexuality",
  "Other"
];

const TAG_OPTIONS = [
  "All",
  "Fact Collection",
  "Questioning the Facts",
  "Seasonal",
  "Regional Lessons",
  "Personal Stories",
  "Website Announcements",
  "Other"
];

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function ArticlesPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"]);
  const [selectedTags, setSelectedTags] = useState<string[]>(["All"]);

  const { data: articles, isLoading } = useQuery<UnifiedArticle[]>({
    queryKey: ["/api/articles"],
  });

  const handleCategoryClick = (category: string) => {
    if (category === "All") {
      setSelectedCategories(["All"]);
    } else {
      const newCategories = selectedCategories.includes("All")
        ? [category]
        : selectedCategories.includes(category)
          ? selectedCategories.filter(c => c !== category)
          : [...selectedCategories, category];
      
      if (newCategories.length === 0) {
        setSelectedCategories(["All"]);
      } else {
        setSelectedCategories(newCategories);
      }
    }
  };

  const handleTagClick = (tag: string) => {
    if (tag === "All") {
      setSelectedTags(["All"]);
    } else {
      const newTags = selectedTags.includes("All")
        ? [tag]
        : selectedTags.includes(tag)
          ? selectedTags.filter(t => t !== tag)
          : [...selectedTags, tag];
      
      if (newTags.length === 0) {
        setSelectedTags(["All"]);
      } else {
        setSelectedTags(newTags);
      }
    }
  };

  const filteredArticles = (articles || [])
    .filter(article => {
      const categoryMatch = selectedCategories.includes("All") || 
        selectedCategories.includes(article.category);
      const tagMatch = selectedTags.includes("All") || 
        (article.tags || []).some(tag => selectedTags.includes(tag));
      return categoryMatch && tagMatch;
    });

  const hasArticles = filteredArticles.length > 0;

  return (
    <div className="articles-page">
      <SEO 
        title="Articles"
        description="Articles exploring misconceptions across history, science, health, and everyday life. Discover the stories behind common myths."
      />
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav sticky />

      <div className="hero-wrapper">
        <HeroSection />
      </div>

      <main className="articles-main">
        <div className="articles-header-row">
          <h1 className="articles-header" data-testid="text-articles-header">Recent articles</h1>
          <button
            className="submit-article-btn"
            disabled
            title="Unavailable in beta"
            data-testid="button-submit-article"
          >
            Submit an Article
          </button>
        </div>

        <div className="filter-section">
          <div className="filter-row">
            <span className="filter-label">Category:</span>
            <div className="filter-chips">
              {CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category}
                  className={`filter-chip ${selectedCategories.includes(category) ? "filter-chip-selected" : ""}`}
                  onClick={() => handleCategoryClick(category)}
                  data-testid={`chip-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-row">
            <span className="filter-label">Tags:</span>
            <div className="filter-chips">
              {TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  className={`filter-chip ${selectedTags.includes(tag) ? "filter-chip-selected" : ""}`}
                  onClick={() => handleTagClick(tag)}
                  data-testid={`chip-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state" data-testid="loading-state">
            <img 
              src="/loading-bar.gif" 
              alt="" 
              className="loading-logo"
              data-testid="img-loading-logo"
            />
          </div>
        ) : hasArticles ? (
          <div className="articles-grid" data-testid="articles-grid">
            {filteredArticles.map(article => (
              <BlogCard
                key={article.id}
                id={article.slug}
                image={article.coverImage}
                date={formatDate(article.isExternal ? article.createdAt : article.publishedAt)}
                category={article.category}
                title={article.title}
                summary={article.summary}
                tags={article.tags || []}
                isExternal={article.isExternal}
                externalUrl={article.externalUrl}
                publicationName={article.publicationName}
                isPaywalled={article.isPaywalled}
                originalPublishedAt={article.isExternal ? formatDate(article.originalPublishedAt) : null}
                publishedAtIso={article.isExternal ? article.createdAt : article.publishedAt}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state" data-testid="empty-state">
            <img 
              src={workInProgressImage} 
              alt="Work in progress" 
              className="empty-state-image"
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
