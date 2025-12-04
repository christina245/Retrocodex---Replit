import { useState } from "react";
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
    description: "Challenging myths about animal behavior, intelligence, safety, and long-held assumptions about creatures from pets to wildlife.",
    photo: photoAnimals
  },
  {
    id: "astronomy",
    name: "ASTRONOMY",
    description: "Unpacking mistaken ideas about space, planets, stars, and how our understanding of the universe continues to evolve.",
    photo: photoAstronomy
  },
  {
    id: "beauty",
    name: "BEAUTY",
    description: "Clarifying misleading claims about skincare, hair, grooming, and products that promise results science doesn't support.",
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
    description: "Breaking down myths about nutrition, ingredients, cooking, and what's actually healthy versus marketing-driven beliefs.",
    photo: photoFood
  },
  {
    id: "linguistics",
    name: "LINGUISTICS",
    description: "Exploring misconceptions about language origins, dialects, grammar rules, and how languages truly change over time.",
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
    description: "Demystifying modern tech—AI, devices, privacy, security—and correcting misunderstandings about how digital systems work.",
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
              <img 
                src={subcategory.photo} 
                alt={subcategory.name} 
                className="subcategory-photo"
              />
              <div className="subcategory-content">
                <h3 className="subcategory-name">{subcategory.name}</h3>
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
