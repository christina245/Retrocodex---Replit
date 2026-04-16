import { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { AuthProvider, useAuth } from "./lib/auth";
import { SignInModal } from "@/components/SignInModal";
import { useToast } from "@/hooks/use-toast";
import HomePage from "@/pages/HomePage";
import AdminPage from "@/pages/AdminPage";
import SingleFactPage from "@/pages/SingleFactPage";
import ArticlesPage from "@/pages/ArticlesPage";
import SingleBlogPage from "@/pages/SingleBlogPage";
import HistoryPage from "@/pages/HistoryPage";
import LifeSciencesPage from "@/pages/LifeSciencesPage";
import EverydayLifePage from "@/pages/EverydayLifePage";
import HealthFitnessPage from "@/pages/HealthFitnessPage";
import SocialSciencesPage from "@/pages/SocialSciencesPage";
import GenderSexualityPage from "@/pages/GenderSexualityPage";
import OtherCategoriesPage from "@/pages/OtherCategoriesPage";
import AboutPage from "@/pages/AboutPage";
import SubmitFactPage from "@/pages/SubmitFactPage";
import FactSubmissionFormPage from "@/pages/FactSubmissionFormPage";
import NotFound from "@/pages/not-found";

import FactsByTagPage from "@/pages/FactsByTagPage";
import SearchResultsPage from "@/pages/SearchResultsPage";
import AnimalsPage from "@/pages/subcategory-pages/AnimalsPage";
import AstronomyPage from "@/pages/subcategory-pages/AstronomyPage";
import BeautyPage from "@/pages/subcategory-pages/BeautyPage";
import EarthSciencePage from "@/pages/subcategory-pages/EarthSciencePage";
import FoodPage from "@/pages/subcategory-pages/FoodPage";
import LinguisticsPage from "@/pages/subcategory-pages/LinguisticsPage";
import MusicPage from "@/pages/subcategory-pages/MusicPage";
import PhysicsPage from "@/pages/subcategory-pages/PhysicsPage";
import TechnologyPage from "@/pages/subcategory-pages/TechnologyPage";
import HolidaysPage from "@/pages/subcategory-pages/HolidaysPage";
import UserDashboard from "@/pages/UserDashboard";
import PublicProfile from "@/pages/PublicProfile";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import RecommendedBooksPage from "@/pages/RecommendedBooksPage";
import FormerCountriesPage from "@/pages/FormerCountriesPage";

function OAuthCallbackHandler() {
  const { refetchUser } = useAuth();
  const { toast } = useToast();
  const [showGoogleSetup, setShowGoogleSetup] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.has("loggedin")) {
      params.delete("loggedin");
      const newUrl = window.location.pathname + (params.toString() ? `?${params}` : "");
      window.history.replaceState({}, "", newUrl);
      refetchUser();
    }

    if (params.has("needs_setup")) {
      params.delete("needs_setup");
      const newUrl = window.location.pathname + (params.toString() ? `?${params}` : "");
      window.history.replaceState({}, "", newUrl);
      setShowGoogleSetup(true);
    }

    if (params.has("oauth_error")) {
      params.delete("oauth_error");
      const newUrl = window.location.pathname + (params.toString() ? `?${params}` : "");
      window.history.replaceState({}, "", newUrl);
      toast({
        title: "Sign-in failed",
        description: "Something went wrong with Google sign-in. Please try again.",
        variant: "destructive",
      });
    }
  }, [refetchUser, toast]);

  if (!showGoogleSetup) return null;

  return (
    <SignInModal
      isOpen={true}
      onClose={() => setShowGoogleSetup(false)}
      googleSetupMode={true}
    />
  );
}

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/backstage-admin-415" component={AdminPage} />
      <Route path="/fact/:id" component={SingleFactPage} />
      <Route path="/articles" component={ArticlesPage} />
      <Route path="/articles/:slug" component={SingleBlogPage} />
      <Route path="/category/history" component={HistoryPage} />
      <Route path="/category/life-sciences" component={LifeSciencesPage} />
      <Route path="/category/everyday-life" component={EverydayLifePage} />
      <Route path="/category/health-fitness" component={HealthFitnessPage} />
      <Route path="/category/social-sciences" component={SocialSciencesPage} />
      <Route path="/category/gender-sexuality" component={GenderSexualityPage} />
      <Route path="/category/other" component={OtherCategoriesPage} />
      <Route path="/category/other/animals" component={AnimalsPage} />
      <Route path="/category/other/astronomy" component={AstronomyPage} />
      <Route path="/category/other/beauty" component={BeautyPage} />
      <Route path="/category/other/earth-science" component={EarthSciencePage} />
      <Route path="/category/other/food" component={FoodPage} />
      <Route path="/category/other/linguistics" component={LinguisticsPage} />
      <Route path="/category/other/music" component={MusicPage} />
      <Route path="/category/other/physics" component={PhysicsPage} />
      <Route path="/category/other/technology" component={TechnologyPage} />
      <Route path="/category/other/holidays" component={HolidaysPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/submit" component={SubmitFactPage} />
      <Route path="/submit/form" component={FactSubmissionFormPage} />
      <Route path="/tags/:tagSlug" component={FactsByTagPage} />
      <Route path="/search/:query" component={SearchResultsPage} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/user/:username" component={PublicProfile} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/recommended-reading" component={RecommendedBooksPage} />
      <Route path="/former-countries" component={FormerCountriesPage} />
      <Route path="/decade/:decade" component={HomePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider delayDuration={0}>
          <Toaster />
          <OAuthCallbackHandler />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
