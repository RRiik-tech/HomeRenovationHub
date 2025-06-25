import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, CheckCircle, Phone, Mail, Calendar, Award } from "lucide-react";

export default function ContractorProfile() {
  const [, params] = useRoute("/contractors/:id");
  const contractorId = parseInt(params?.id || "0");

  const { data: contractor, isLoading } = useQuery({
    queryKey: [`/api/contractors/${contractorId}`],
    enabled: !!contractorId,
  });

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-5 h-5 ${i < Math.floor(numRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
        />
      );
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Contractor Not Found</h2>
            <p className="text-gray-600">The contractor profile you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle>About {contractor.companyName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">{contractor.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {contractor.specialties.map((specialty: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Credentials</h4>
                  <div className="space-y-2">
                    {contractor.licenseNumber && (
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">License: {contractor.licenseNumber}</span>
                      </div>
                    )}
                    {contractor.insuranceNumber && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Insured: {contractor.insuranceNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">{contractor.experienceYears}+ Years Experience</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Section */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              {contractor.portfolio && contractor.portfolio.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {contractor.portfolio.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={`/api/uploads/${image}`}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg hover-lift cursor-pointer"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No portfolio images available yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-600">No reviews available yet.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Reviews will appear here once this contractor completes projects.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contractor Card */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {contractor.user ? (
                  <span className="text-3xl font-bold text-primary">
                    {contractor.user.firstName[0]}{contractor.user.lastName[0]}
                  </span>
                ) : (
                  <span className="text-3xl font-bold text-gray-600">?</span>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {contractor.user ? 
                  `${contractor.user.firstName} ${contractor.user.lastName}` : 
                  'Unknown'
                }
              </h2>
              
              <p className="text-orange-600 font-medium mb-3">{contractor.companyName}</p>
              
              <div className="flex items-center justify-center mb-4">
                <div className="flex">
                  {renderStars(contractor.rating)}
                </div>
                <span className="text-gray-500 ml-2">
                  {contractor.rating} ({contractor.reviewCount} reviews)
                </span>
              </div>
              
              {contractor.isVerified && (
                <div className="flex items-center justify-center space-x-1 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">Verified Contractor</span>
                </div>
              )}
              
              <div className="flex items-center justify-center space-x-2 text-gray-600 mb-6">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">
                  {contractor.user ? 
                    `${contractor.user.city}, ${contractor.user.state}` : 
                    'Location unknown'
                  }
                </span>
              </div>
              
              <div className="space-y-2">
                <Button className="w-full button-gradient text-white">
                  Get Quote
                </Button>
                <Button variant="outline" className="w-full">
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contractor.user?.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>{contractor.user.phone}</span>
                </div>
              )}
              {contractor.user?.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>{contractor.user.email}</span>
                </div>
              )}
              {contractor.user?.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p>{contractor.user.address}</p>
                    <p>{contractor.user.city}, {contractor.user.state} {contractor.user.zipCode}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Experience</span>
                <span className="font-semibold">{contractor.experienceYears}+ years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Projects Completed</span>
                <span className="font-semibold">50+</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Rating</span>
                <span className="font-semibold">{contractor.rating}/5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Response Time</span>
                <span className="font-semibold">&lt; 2 hours</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
