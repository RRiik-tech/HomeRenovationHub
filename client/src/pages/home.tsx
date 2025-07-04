import HeroSection from "@/components/hero-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Users, Clock, Shield, Wrench } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import AuthModal from "@/components/auth-modal";
import { FirebaseTest } from "@/components/firebase-test";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Verified Contractors",
      description: "All contractors are background-checked and verified for quality and reliability."
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-600" />,
      title: "Competitive Bidding",
      description: "Get multiple quotes from qualified contractors to ensure the best price."
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "Secure Payments",
      description: "Protected payment system ensures your money is safe until work is completed."
    },
    {
      icon: <Clock className="h-8 w-8 text-purple-600" />,
      title: "Project Management",
      description: "Track your project progress with real-time updates and messaging."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Homeowner",
      content: "Found an amazing contractor for my kitchen remodel. The bidding process was transparent and saved me thousands!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Contractor",
      content: "HomeConnect Pro has helped me grow my business significantly. Great platform to connect with quality clients.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Firebase Test Section - Only show in development */}
      {import.meta.env.DEV && (
        <section className="py-8 bg-yellow-50 border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <FirebaseTest />
          </div>
        </section>
      )}

      {/* Welcome Message for Authenticated Users */}
      {isAuthenticated && user && (
        <section className="py-12 bg-blue-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome back, {user.firstName}! 👋
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Ready to {user.userType === 'contractor' ? 'find new projects' : 'start your next renovation project'}?
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                {user.userType === 'contractor' ? (
                  <>
                    <Link href="/find-projects">
                      <Button size="lg" className="button-gradient text-white">
                        Browse Projects
                      </Button>
                    </Link>
                    <Link href="/contractor-dashboard">
                      <Button size="lg" variant="outline">
                        View Dashboard
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/post-project">
                      <Button size="lg" className="button-gradient text-white">
                        Post a Project
                      </Button>
                    </Link>
                    <Link href="/find-contractors">
                      <Button size="lg" variant="outline">
                        Find Contractors
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose HomeConnect Pro?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with trusted professionals, manage your projects seamlessly, and get the best value for your home renovation needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get your project done in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Post Your Project</h3>
              <p className="text-gray-600">
                Describe your renovation project and get matched with qualified contractors in your area.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Compare Bids</h3>
              <p className="text-gray-600">
                Receive competitive quotes from verified contractors and choose the best fit for your project.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get It Done</h3>
              <p className="text-gray-600">
                Work with your chosen contractor using our secure platform and project management tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-gray-600">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of homeowners and contractors who trust HomeConnect Pro for their renovation projects.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <AuthModal>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                  Sign Up Now - It's Free!
                </Button>
              </AuthModal>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Learn More
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
