import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Star, CreditCard, FileText, Calendar, Bell, Store, Smartphone } from "lucide-react";

export default function FeatureTestPage() {
  const features = [
    {
      name: "Analytics Dashboard",
      description: "Business intelligence and performance metrics",
      path: "/analytics",
      icon: BarChart3,
      color: "bg-blue-500"
    },
    {
      name: "Reviews System",
      description: "Rating and review management",
      path: "/reviews",
      icon: Star,
      color: "bg-yellow-500"
    },
    {
      name: "Payment System",
      description: "Secure payments and escrow management",
      path: "/payments",
      icon: CreditCard,
      color: "bg-green-500"
    },
    {
      name: "Document Manager",
      description: "File and document organization",
      path: "/documents",
      icon: FileText,
      color: "bg-purple-500"
    },
    {
      name: "Project Calendar",
      description: "Timeline and milestone tracking",
      path: "/calendar",
      icon: Calendar,
      color: "bg-red-500"
    },
    {
      name: "Notifications",
      description: "Real-time alerts and updates",
      path: "/notifications",
      icon: Bell,
      color: "bg-orange-500"
    },
    {
      name: "Marketplace",
      description: "Contractor marketplace and listings",
      path: "/marketplace",
      icon: Store,
      color: "bg-indigo-500"
    },
    {
      name: "Mobile App",
      description: "Progressive web app experience",
      path: "/mobile",
      icon: Smartphone,
      color: "bg-pink-500"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🎉 All Features Are Live!</h1>
          <p className="text-xl text-gray-600 mb-6">
            Test all the comprehensive features that have been added to the platform
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-medium">
              ✅ All 8 major feature sets are now accessible through the navigation menu
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card key={feature.name} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-3`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={feature.path}>
                    <Button className="w-full" variant="outline">
                      Test Feature
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">How to Access Features</h2>
          <div className="space-y-3 text-blue-800">
            <p className="flex items-center">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
              <strong>Sign in/Register</strong> to access your account
            </p>
            <p className="flex items-center">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
              <strong>Click your profile avatar</strong> in the top-right corner
            </p>
            <p className="flex items-center">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
              <strong>Browse the dropdown menu</strong> to access all features
            </p>
            <p className="flex items-center">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
              <strong>Or use direct URLs</strong> like /analytics, /reviews, etc.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 