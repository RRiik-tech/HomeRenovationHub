import HeroSection from "@/components/hero-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Star, Users, Clock, Shield, Wrench, Plus, TrendingUp, Calendar, MessageSquare, FileText, DollarSign, Building, Target, Award, MapPin, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import AuthModal from "@/components/auth-modal";
// import { FirebaseTest } from "@/components/firebase-test";
import { Link } from "wouter";

// Homeowner Dashboard Component
function HomeownerDashboard({ user }: { user: any }) {
  const recentProjects = [
    { id: 1, title: "Kitchen Renovation", status: "In Progress", progress: 75, budget: 45000, contractor: "Elite Renovations" },
    { id: 2, title: "Bathroom Remodel", status: "Planning", progress: 20, budget: 25000, contractor: "Premium Builders" },
    { id: 3, title: "Living Room Flooring", status: "Completed", progress: 100, budget: 15000, contractor: "Craft Masters" }
  ];

  const quickStats = {
    totalProjects: 8,
    activeProjects: 2,
    totalSpent: 125000,
    avgRating: 4.7
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-3xl font-bold text-gray-900">{quickStats.totalProjects}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-3xl font-bold text-gray-900">{quickStats.activeProjects}</p>
                </div>
                <Zap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Invested</p>
                  <p className="text-3xl font-bold text-gray-900">${quickStats.totalSpent.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-3xl font-bold text-gray-900">{quickStats.avgRating}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Projects</CardTitle>
                <Link href="/post-project">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{project.title}</h3>
                        <Badge variant={project.status === 'Completed' ? 'default' : project.status === 'In Progress' ? 'secondary' : 'outline'}>
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Contractor: {project.contractor}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="mb-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Budget: ${project.budget.toLocaleString()}</span>
                        <Link href={`/project-details/${project.id}`}>
                          <Button variant="ghost" size="sm">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Updates */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/post-project" className="block">
                  <Button className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Project
                  </Button>
                </Link>
                <Link href="/find-contractors" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Find Contractors
                  </Button>
                </Link>
                <Link href="/messages" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </Button>
                </Link>
                <Link href="/analytics" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Kitchen milestone completed</p>
                      <p className="text-xs text-gray-600">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">New message from contractor</p>
                      <p className="text-xs text-gray-600">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Document uploaded</p>
                      <p className="text-xs text-gray-600">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Contractor Dashboard Component
function ContractorDashboard({ user }: { user: any }) {
  const activeProjects = [
    { id: 1, title: "Luxury Kitchen Remodel", client: "Smith Family", deadline: "2024-02-15", value: 65000, status: "In Progress" },
    { id: 2, title: "Master Bathroom", client: "Johnson Family", deadline: "2024-01-30", value: 35000, status: "Planning" },
    { id: 3, title: "Living Room Renovation", client: "Brown Family", deadline: "2024-03-10", value: 45000, status: "Proposal" }
  ];

  const businessStats = {
    totalProjects: 47,
    monthlyRevenue: 55000,
    avgRating: 4.8,
    responseRate: 94
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-3xl font-bold text-gray-900">{businessStats.totalProjects}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">${businessStats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-3xl font-bold text-gray-900">{businessStats.avgRating}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{businessStats.responseRate}%</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Active Projects</CardTitle>
                <Link href="/marketplace">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Find Projects
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{project.title}</h3>
                        <Badge variant={project.status === 'In Progress' ? 'default' : project.status === 'Planning' ? 'secondary' : 'outline'}>
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Client: {project.client}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Value: ${project.value.toLocaleString()}</span>
                        <span className="text-sm text-gray-600">Due: {project.deadline}</span>
                        <Link href={`/project-details/${project.id}`}>
                          <Button variant="ghost" size="sm">Manage</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Tools & Updates */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/marketplace" className="block">
                  <Button className="w-full justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    Browse Projects
                  </Button>
                </Link>
                <Link href="/contractor-dashboard" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/bid-management" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Manage Bids
                  </Button>
                </Link>
                <Link href="/analytics" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Kitchen Renovation</p>
                      <p className="text-xs text-gray-600">San Francisco, CA</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">$45k</p>
                      <Button size="sm" variant="ghost">Bid</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Bathroom Remodel</p>
                      <p className="text-xs text-gray-600">Oakland, CA</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">$25k</p>
                      <Button size="sm" variant="ghost">Bid</Button>
                    </div>
                  </div>
                  <Link href="/marketplace">
                    <Button variant="outline" className="w-full mt-3">View All Projects</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Marketing Landing Page for Non-Authenticated Users
function MarketingLandingPage() {
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
    </div>
  );
}

// Main Home Component
export default function Home() {
  const { isAuthenticated, user } = useAuth();

  // Show different content based on authentication and user type
  if (!isAuthenticated || !user) {
    return <MarketingLandingPage />;
  }

  if (user.userType === 'contractor') {
    return <ContractorDashboard user={user} />;
  }

  return <HomeownerDashboard user={user} />;
}
