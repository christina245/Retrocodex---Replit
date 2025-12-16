import { useState } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { CategoryNav } from "@/components/CategoryNav";
import { Footer } from "@/components/Footer";
import "./OtherCategoriesPage.css";

import photoAnimals from "@assets/animals_1764816085493.png";
import photoAstronomy from "@assets/astronomy_1764816085492.png";
import photoBeauty from "@assets/beauty_1764816085492.png";
import photoEarthScience from "@assets/earth_science_1764816085491.png";
import photoFood from "@assets/food_1764816085491.png";
import photoLinguistics from "@assets/linguistics_1764816085490.png";
import photoMusic from "@assets/music_1764816085490.png";
import photoPhysics from "@assets/physics_1764816085489.png";
import photoTechnology from "@assets/tech_1764816085490.png";
import photoUncategorized from "@assets/uncategorized_1764816085488.png";

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
    description: "Some animals may be safer or more dangerous than you think.",
    photo: photoAnimals
  },
  {
    id: "astronomy",
    name: "ASTRONOMY",
    description: "Mistaken ideas about space, planets, stars, and how our understanding of the universe continues to evolve.",
    photo: photoAstronomy
  },
  {
    id: "beauty",
    name: "BEAUTY",
    description: "Several ingredients you were told to avoid in beauty products might not deserve that stigma. Some beauty tips and tricks you might have learned might not give you the glow-up you're looking for.",
    photo: photoBeauty
  },
  {
    id: "earth-science",
    name: "EARTH SCIENCE",
    description: "Addressing common errors about weather, climate, geology, oceans, and the forces that shape our planet.",
    photo: photoEarthScience
  },
  {
    id: "food",
    name: "FOOD",
    description: "Years of deceptive marketing have given us the wrong ideas of what foods and nutrients are actually healthy.",
    photo: photoFood
  },
  {
    id: "linguistics",
    name: "LINGUISTICS",
    description: "You've probably been pronouncing some words wrong for years. Some spelling and grammar rules you might have been taught were vast overgeneralizations.",
    photo: photoLinguistics
  },
  {
    id: "music",
    name: "MUSIC",
    description: "Revealing mistaken beliefs about music history, genres, theory, production, and how humans perceive and create sound.",
    photo: photoMusic
  },
  {
    id: "physics",
    name: "PHYSICS",
    description: "Untangling oversimplified or outdated ideas about motion, energy, forces, matter, and the nature of the physical world.",
    photo: photoPhysics
  },
  {
    id: "technology",
    name: "TECHNOLOGY",
    description: "What is today's technology actually capable of? Is AI actually on par with human abilities?",
    photo: photoTechnology
  },
  {
    id: "uncategorized",
    name: "UNCATEGORIZED",
    description: "A mix of widespread misconceptions that don't fit neatly elsewhere but expose how everyday assumptions can mislead us.",
    photo: photoUncategorized
  }
];

export default function OtherCategoriesPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="other-categories-page">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <CategoryNav selectedCategory="OTHER" />

      <main className="other-categories-main-content">
        <h1 className="other-categories-title">Other categories</h1>

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
