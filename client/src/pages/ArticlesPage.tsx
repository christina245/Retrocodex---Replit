import { useState } from "react";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { CategoryNav } from "@/components/CategoryNav";
import { Footer } from "@/components/Footer";
import workInProgressImage from "@assets/No articles found (yet)._1764112278730.png";
import "./ArticlesPage.css";

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
  "Facts",
  "Seasonal",
  "Regional Lessons",
  "Personal Stories",
  "Website Announcements",
  "Other"
];

export default function ArticlesPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"]);
  const [selectedTags, setSelectedTags] = useState<string[]>(["All"]);

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

  const hasArticles = false;

  return (
    <div className="articles-page">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <CategoryNav />

      <main className="articles-main">
        <h1 className="articles-header" data-testid="text-articles-header">Recent articles</h1>

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

        {hasArticles ? (
          <div className="articles-grid" data-testid="articles-grid">
            {/* Blog posts will be added later */}
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
