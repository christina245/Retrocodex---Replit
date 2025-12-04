import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/HomePage";
import AdminPage from "@/pages/AdminPage";
import SingleFactPage from "@/pages/SingleFactPage";
import ArticlesPage from "@/pages/ArticlesPage";
import HistoryPage from "@/pages/HistoryPage";
import LifeSciencesPage from "@/pages/LifeSciencesPage";
import EverydayLifePage from "@/pages/EverydayLifePage";
import HealthFitnessPage from "@/pages/HealthFitnessPage";
import SocialSciencesPage from "@/pages/SocialSciencesPage";
import GenderSexualityPage from "@/pages/GenderSexualityPage";
import OtherCategoriesPage from "@/pages/OtherCategoriesPage";
import AboutPage from "@/pages/AboutPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/fact/:id" component={SingleFactPage} />
      <Route path="/articles" component={ArticlesPage} />
      <Route path="/category/history" component={HistoryPage} />
      <Route path="/category/life-sciences" component={LifeSciencesPage} />
      <Route path="/category/everyday-life" component={EverydayLifePage} />
      <Route path="/category/health-fitness" component={HealthFitnessPage} />
      <Route path="/category/social-sciences" component={SocialSciencesPage} />
      <Route path="/category/gender-sexuality" component={GenderSexualityPage} />
      <Route path="/category/other" component={OtherCategoriesPage} />
      <Route path="/about" component={AboutPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
