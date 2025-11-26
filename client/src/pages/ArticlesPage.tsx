import { useState } from "react";
import { Scroll, Home } from "lucide-react";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { CategoryNav } from "@/components/CategoryNav";
import { Footer } from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import workInProgressImage from "@assets/No articles found (yet)._1764112278730.png";
import thanksgivingImage from "@assets/thanksgiving myths stock photo_1763852604175.jpg";
import holidayFamilyImage from "@assets/family at the holidays.jpg";
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

interface BlogPost {
  id: string;
  image: string;
  date: string;
  dateValue: Date;
  category: string;
  categoryIcon: typeof Scroll;
  categoryColor: string;
  title: string;
  summary: string;
  tags: string[];
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: "holiday-family-reunions",
    image: holidayFamilyImage,
    date: "Nov. 27, 2025",
    dateValue: new Date(2025, 10, 27),
    category: "Everyday Life",
    categoryIcon: Home,
    categoryColor: "#2C2C2C",
    title: "8 Myths You Might Hear At Holiday Family Reunions",
    summary: "Every holiday season, millions of Americans return home to familiar food, familiar traditions, and familiar misconceptions passed down through generations. Whether it's an aunt insisting that cold weather...",
    tags: ["Facts"]
  },
  {
    id: "thanksgiving-myths",
    image: thanksgivingImage,
    date: "Nov. 23, 2025",
    dateValue: new Date(2025, 10, 23),
    category: "History",
    categoryIcon: Scroll,
    categoryColor: "#2C2C2C",
    title: "5 Myths You Might Have Learned About Thanksgiving",
    summary: "Did you know that there's no solid record that turkey was actually served at the 1621 \"first Thanksgiving meal\"? Let's take a closer look at the real history behind the iconic American holiday, from the...",
    tags: ["Facts"]
  }
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

  const filteredPosts = BLOG_POSTS.filter(post => {
    const categoryMatch = selectedCategories.includes("All") || 
      selectedCategories.includes(post.category);
    const tagMatch = selectedTags.includes("All") || 
      post.tags.some(tag => selectedTags.includes(tag));
    return categoryMatch && tagMatch;
  }).sort((a, b) => b.dateValue.getTime() - a.dateValue.getTime());

  const hasArticles = filteredPosts.length > 0;

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
            {filteredPosts.map(post => (
              <BlogCard
                key={post.id}
                id={post.id}
                image={post.image}
                date={post.date}
                category={post.category}
                categoryIcon={post.categoryIcon}
                categoryColor={post.categoryColor}
                title={post.title}
                summary={post.summary}
                tags={post.tags}
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
