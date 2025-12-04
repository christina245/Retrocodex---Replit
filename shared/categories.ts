import { Scroll, Dna, Home, Dumbbell, Users, Heart, Zap, Activity, HeartHandshake, DiamondPlus } from "lucide-react";

export interface Category {
  name: string;
  icon: any;
  color: string;
  path: string;
}

export const CATEGORIES: Category[] = [
  { name: "HISTORY", icon: Scroll, color: "#F5D547", path: "/category/history" },
  { name: "LIFE SCIENCES", icon: Dna, color: "#6FCF97", path: "/category/life-sciences" },
  { name: "EVERYDAY LIFE", icon: Home, color: "#2A9BEC", path: "/category/everyday-life" },
  { name: "HEALTH & FITNESS", icon: Activity, color: "#F2994A", path: "/category/health-fitness" },
  { name: "SOCIAL SCIENCES", icon: Users, color: "#9B51E0", path: "/category/social-sciences" },
  { name: "GENDER & SEXUALITY", icon: HeartHandshake, color: "#FC5AA8", path: "/category/gender-sexuality" },
  { name: "OTHER", icon: DiamondPlus, color: "#2C2C2C", path: "/category/other" },
];

export function getCategoryConfig(categoryName: string): Category | undefined {
  return CATEGORIES.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
}
