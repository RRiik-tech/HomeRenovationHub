import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from 'next-themes';

// Pages
import Home from './pages/home';
import UserDashboard from './pages/user-dashboard';
import ContractorDashboard from './pages/contractor-dashboard';
import ProjectDetails from './pages/project-details';
import PostProject from './pages/post-project';
import FindContractors from './pages/find-contractors';
import ContractorProfile from './pages/contractor-profile';
import Marketplace from './pages/marketplace';
import Messages from './pages/messaging';
import Notifications from './pages/notifications';
import Calendar from './pages/calendar';
import Documents from './pages/documents';
import Payments from './pages/payments';
import Reviews from './pages/reviews';
import Analytics from './pages/analytics';
import NotFound from './pages/not-found';

// Components
import Navigation from './components/navigation';
import { AuthProvider } from './hooks/use-auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/contractor/dashboard" element={<ContractorDashboard />} />
                  <Route path="/projects/:id" element={<ProjectDetails />} />
                  <Route path="/post-project" element={<PostProject />} />
                  <Route path="/find-contractors" element={<FindContractors />} />
                  <Route path="/contractor/:id" element={<ContractorProfile />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
