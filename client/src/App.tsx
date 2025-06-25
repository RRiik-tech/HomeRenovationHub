import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import PostProject from "@/pages/post-project";
import FindContractors from "@/pages/find-contractors";
import ProjectDetails from "@/pages/project-details";
import ContractorProfile from "@/pages/contractor-profile";
import BidManagement from "@/pages/bid-management";
import Messaging from "@/pages/messaging";
import Navigation from "@/components/navigation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/post-project" component={PostProject} />
      <Route path="/find-contractors" component={FindContractors} />
      <Route path="/projects/:id" component={ProjectDetails} />
      <Route path="/contractors/:id" component={ContractorProfile} />
      <Route path="/projects/:id/bids" component={BidManagement} />
      <Route path="/messaging/:projectId?" component={Messaging} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
