import { useState } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ScrungyBooksPromo } from "@/components/ScrungyBooksPromo";
import "./OtherCategoriesPage.css";

import photoAnimals from "@assets/animals_1764816085493.png";
import photoAstronomy from "@assets/astronomy_1764816085492.png";
import photoBeauty from "@assets/beauty_1764816085492.png";
import photoEarthScience from "@assets/earth_science_1764816085491.png";
import photoFood from "@assets/food_1764816085491.png";
import photoHolidays from "@assets/holidays_1766472598101.png";
import photoLinguistics from "@assets/linguistics_1764816085490.png";
import photoMusic from "@assets/music_1764816085490.png";
import photoPhysics from "@assets/physics_1764816085489.png";
import photoTechnology from "@assets/tech_1764816085490.png";

interface Subcategory {
  id: string;
  name: string;
  description: string;
  photo: string;
}

const subcategories: Subcategory[] = [
  {
    id: "animals",
    name: "ANIMALS",
    description: "Some animals may be safer or more dangerous than you think. Popular ideas about animal behavior, intelligence, and instinct are often oversimplified, exaggerated, or based on outdated science.",
    photo: photoAnimals
  },
  {
    id: "astronomy",
    name: "ASTRONOMY",
    description: "Is Pluto a planet? What can you actually see from space? Common ideas about planets, stars, and the universe are often simplified or misunderstood.",
    photo: photoAstronomy
  },
  {
    id: "beauty",
    name: "BEAUTY",
    description: "Certain ingredients in beauty products may have been unfairly stigmatized. Some beauty tips and tricks you might have learned won't give you the glow-up you're looking for.",
    photo: photoBeauty
  },
  {
    id: "earth-science",
    name: "EARTH SCIENCE",
    description: "As new discoveries are continuously unearthed, many facts about the environmental forces shaping our planet have evolved since the textbooks of our school days were published.",
    photo: photoEarthScience
  },
  {
    id: "food",
    name: "FOOD",
    description: "Many beliefs about nutrition, ingredients, and eating habits are frequently influenced by marketing, tradition, xenophobia, or outdated research rather than modern science.",
    photo: photoFood
  },
  {
    id: "holidays",
    name: "HOLIDAYS",
    description: "Some of our holiday rituals may not mean what you think they mean. The real stories behind Christmas, Thanksgiving, Easter, and other holidays are often simplified, sanitized, or uncertain.",
    photo: photoHolidays
  },
  {
    id: "linguistics",
    name: "LINGUISTICS",
    description: "You've probably been pronouncing certain words wrong. Some spelling and grammar rules you might have been taught are vast overgeneralizations.",
    photo: photoLinguistics
  },
  {
    id: "music",
    name: "MUSIC",
    description: "Explore what facts about musicians, music production, and musical genres may have been distorted due to audience distaste or adoration.",
    photo: photoMusic
  },
  {
    id: "physics",
    name: "PHYSICS",
    description: "Many of the simplified explanations we were taught growing up may have left behind important nuances about how motion, energy, and matter really behave.",
    photo: photoPhysics
  },
  {
    id: "technology",
    name: "TECHNOLOGY",
    description: "What is today's technology actually capable of? In an era of unusually rapid innovation, myths about tech's capabilities are easily spread by hype, media portrayals, or overgeneralizations.",
    photo: photoTechnology
  }
];

export default function OtherCategoriesPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="other-categories-page">
      <SEO 
        title="Other Categories"
        description="Explore additional fact categories including Animals, Astronomy, Beauty, Food, Music, Technology, and more. Discover misconceptions beyond the main topics."
      />
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav activeCategory="OTHER" sticky />

      <main className="other-categories-main-content">
        <div className="other-categories-intro-row">
          <h1 className="other-categories-title">All Common Misconceptions In Other Categories</h1>
          <div className="other-categories-scrungy-promo-wrapper">
            <ScrungyBooksPromo />
          </div>
        </div>

        <div className="subcategories-grid">
          {subcategories.map((subcategory) => (
            <div 
              key={subcategory.id} 
              className="subcategory-card"
              data-testid={`card-subcategory-${subcategory.id}`}
            >
              <Link 
                href={`/category/other/${subcategory.id}`}
                className="subcategory-photo-link"
                data-testid={`link-subcategory-photo-${subcategory.id}`}
              >
                <img 
                  src={subcategory.photo} 
                  alt={subcategory.name} 
                  className="subcategory-photo"
                />
              </Link>
              <div className="subcategory-content">
                <Link 
                  href={`/category/other/${subcategory.id}`}
                  className="subcategory-name"
                  data-testid={`link-subcategory-name-${subcategory.id}`}
                >
                  {subcategory.name}
                </Link>
                <p className="subcategory-description">{subcategory.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
