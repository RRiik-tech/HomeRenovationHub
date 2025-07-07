import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import AuthModal from "@/components/auth-modal";
import { useAuth } from "@/hooks/use-auth";

export default function HeroSection() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="hero-gradient text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="fade-in">
            {isAuthenticated && user ? (
              <>
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                  Welcome back, <span className="text-orange-300">{user.firstName}</span>! 👋
                </h1>
                <p className="text-xl mb-8 text-blue-100">
                  Ready to {user.userType === 'contractor' ? 'find new projects and grow your business' : 'start your next renovation project'}? 
                  Your trusted platform for home renovation projects is ready for you.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  {user.userType === 'contractor' ? (
                    <>
                      <Link href="/marketplace">
                        <Button size="lg" className="button-gradient text-white font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
                          Browse Projects
                        </Button>
                      </Link>
                      <Link href="/contractor-dashboard">
                        <Button 
                          size="lg" 
                          variant="outline" 
                          className="glassmorphism border-white/20 text-white hover:bg-white/20 w-full sm:w-auto"
                        >
                          View Dashboard
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/post-project">
                        <Button size="lg" className="button-gradient text-white font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
                          Post a Project
                        </Button>
                      </Link>
                      <Link href="/find-contractors">
                        <Button 
                          size="lg" 
                          variant="outline" 
                          className="glassmorphism border-white/20 text-white hover:bg-white/20 w-full sm:w-auto"
                        >
                          Find Contractors
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                  Connect with <span className="text-orange-300">Trusted</span> Contractors
                </h1>
                <p className="text-xl mb-8 text-blue-100">
                  Get competitive bids from verified contractors for your home renovation projects. 
                  From kitchen remodels to roof repairs, find the right professional for any job.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <AuthModal>
                    <Button size="lg" className="button-gradient text-white font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
                      Sign in and get started
                    </Button>
                  </AuthModal>
                  <Link href="/find-contractors">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="glassmorphism border-white/20 text-white hover:bg-white/20 w-full sm:w-auto"
                    >
                      Find Contractors
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Modern kitchen renovation in progress" 
              className="rounded-2xl shadow-2xl hover-lift"
            />
            <div className="absolute -bottom-6 -left-6 glassmorphism rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">500+ Projects Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
