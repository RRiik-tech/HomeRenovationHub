import React from "react";
import { Router, Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import { MobileAppShell } from "@/components/mobile-app-shell";
import Navigation from "@/components/navigation";

// Pages
import Home from "@/pages/home";
import FindContractors from "@/pages/find-contractors";
import PostProject from "@/pages/post-project";
import ProjectDetails from "@/pages/project-details";
import ContractorProfile from "@/pages/contractor-profile";
import Profile from "@/pages/profile";
import UserDashboard from "@/pages/user-dashboard";
import ContractorDashboard from "@/pages/contractor-dashboard";
import BidManagement from "@/pages/bid-management";
import ContractorBidManagement from "@/pages/contractor-bid-management";
import Messaging from "@/pages/messaging";
import AIRecommendations from "@/pages/ai-recommendations";
import Analytics from "@/pages/analytics";
import Reviews from "@/pages/reviews";
import Payments from "@/pages/payments";
import Documents from "@/pages/documents";
import Calendar from "@/pages/calendar";
import Notifications from "@/pages/notifications";
import Marketplace from "@/pages/marketplace";
import MobilePage from "@/pages/mobile";
import FeatureTest from "@/pages/feature-test";
import NotFound from "@/pages/not-found";

console.log("App.tsx loaded");

function App() {
  console.log("App component rendering");
  const { isAuthenticated, user } = useAuth();
  const isMobile = useMobile();

  // Mobile App Shell for mobile devices
  if (isMobile) {
    return (
      <Router>
        <MobileAppShell>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/find-contractors" component={FindContractors} />
            <Route path="/post-project" component={PostProject} />
            <Route path="/project/:id" component={ProjectDetails} />
            <Route path="/contractor/:id" component={ContractorProfile} />
            <Route path="/profile" component={Profile} />
            <Route path="/user-dashboard" component={UserDashboard} />
            <Route path="/contractor-dashboard" component={ContractorDashboard} />
            <Route path="/bid-management" component={BidManagement} />
            <Route path="/contractor-bid-management" component={ContractorBidManagement} />
            <Route path="/messaging" component={Messaging} />
            <Route path="/messages" component={Messaging} />
            <Route path="/ai-recommendations/:projectId" component={AIRecommendations} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/reviews" component={Reviews} />
            <Route path="/payments" component={Payments} />
            <Route path="/documents" component={Documents} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/marketplace" component={Marketplace} />
            <Route path="/mobile" component={MobilePage} />
            <Route path="/feature-test" component={FeatureTest} />
            <Route component={NotFound} />
          </Switch>
        </MobileAppShell>
        <Toaster />
      </Router>
    );
  }

  // Desktop layout
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/find-contractors" component={FindContractors} />
            <Route path="/post-project" component={PostProject} />
            <Route path="/project/:id" component={ProjectDetails} />
            <Route path="/contractor/:id" component={ContractorProfile} />
            <Route path="/profile" component={Profile} />
            <Route path="/user-dashboard" component={UserDashboard} />
            <Route path="/contractor-dashboard" component={ContractorDashboard} />
            <Route path="/bid-management" component={BidManagement} />
            <Route path="/contractor-bid-management" component={ContractorBidManagement} />
            <Route path="/messaging" component={Messaging} />
            <Route path="/messages" component={Messaging} />
            <Route path="/ai-recommendations/:projectId" component={AIRecommendations} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/reviews" component={Reviews} />
            <Route path="/payments" component={Payments} />
            <Route path="/documents" component={Documents} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/marketplace" component={Marketplace} />
            <Route path="/mobile" component={MobilePage} />
            <Route path="/feature-test" component={FeatureTest} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      <Toaster />
    </Router>
  );
}

export default App;
