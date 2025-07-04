import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Search,
  Filter,
  MapPin,
  Star,
  Shield,
  Award,
  Zap,
  Crown,
  Heart,
  Eye,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Bookmark,
  Share,
  MessageSquare,
  ThumbsUp,
  Building,
  Target,
  Sparkles,
  Flame,
  Trophy,
  Diamond
} from "lucide-react";
import { Link } from "wouter";

interface Contractor {
  id: number;
  companyName: string;
  description: string;
  specialties: string[];
  location: string;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  yearsExperience: number;
  isVerified: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  responseTime: string;
  priceRange: string;
  availability: 'available' | 'busy' | 'booked';
  subscriptionTier: 'basic' | 'pro' | 'premium' | 'enterprise';
  profileImage?: string;
  portfolioImages: string[];
  certifications: string[];
  insuranceVerified: boolean;
  backgroundChecked: boolean;
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  promotions?: {
    type: 'discount' | 'free_consultation' | 'priority_response';
    description: string;
    validUntil: string;
  }[];
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  recentWork: {
    projectType: string;
    completedDate: string;
    clientReview: string;
    rating: number;
  }[];
}

export default function ContractorMarketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState("browse");
  const [savedContractors, setSavedContractors] = useState<number[]>([]);

  // Fetch contractors
  const { data: contractors = [], isLoading } = useQuery({
    queryKey: ['contractors-marketplace', searchQuery, selectedCategory, selectedLocation, sortBy],
    queryFn: async () => {
      // Mock data - in real app, this would be an API call
      return generateMockContractors();
    },
  });

  const categories = [
    "All Categories", "Kitchen Renovation", "Bathroom Remodeling", "Roofing", 
    "Flooring", "Painting", "Electrical", "Plumbing", "HVAC", "Landscaping"
  ];

  const locations = [
    "All Locations", "San Francisco, CA", "Los Angeles, CA", "Seattle, WA", 
    "Portland, OR", "San Diego, CA", "Sacramento, CA", "Oakland, CA"
  ];

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return <Badge className="bg-purple-600 text-white"><Diamond className="h-3 w-3 mr-1" />Enterprise</Badge>;
      case 'premium':
        return <Badge className="bg-yellow-600 text-white"><Crown className="h-3 w-3 mr-1" />Premium</Badge>;
      case 'pro':
        return <Badge className="bg-blue-600 text-white"><Trophy className="h-3 w-3 mr-1" />Pro</Badge>;
      default:
        return <Badge variant="outline">Basic</Badge>;
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'text-green-600 bg-green-50';
      case 'busy':
        return 'text-yellow-600 bg-yellow-50';
      case 'booked':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleSaveContractor = (contractorId: number) => {
    setSavedContractors(prev => 
      prev.includes(contractorId) 
        ? prev.filter(id => id !== contractorId)
        : [...prev, contractorId]
    );
    
    toast({
      title: savedContractors.includes(contractorId) ? "Contractor Removed" : "Contractor Saved",
      description: savedContractors.includes(contractorId) 
        ? "Contractor removed from your saved list" 
        : "Contractor added to your saved list",
    });
  };

  // Filter contractors
  const filteredContractors = contractors.filter((contractor: Contractor) => {
    const matchesSearch = contractor.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contractor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contractor.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || 
                           contractor.specialties.some(s => s.toLowerCase().includes(selectedCategory.toLowerCase()));
    
    const matchesLocation = selectedLocation === "all" || 
                           contractor.location.includes(selectedLocation);
    
    const matchesRating = contractor.rating >= ratingFilter;
    
    const matchesAvailability = availabilityFilter === "all" || 
                               contractor.availability === availabilityFilter;
    
    const matchesFeatured = !showFeaturedOnly || contractor.isFeatured;
    
    const matchesVerified = !showVerifiedOnly || contractor.isVerified;

    return matchesSearch && matchesCategory && matchesLocation && 
           matchesRating && matchesAvailability && matchesFeatured && matchesVerified;
  });

  // Sort contractors
  const sortedContractors = [...filteredContractors].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'reviews':
        return b.reviewCount - a.reviewCount;
      case 'experience':
        return b.yearsExperience - a.yearsExperience;
      case 'projects':
        return b.completedProjects - a.completedProjects;
      default:
        return 0;
    }
  });

  // Separate featured contractors
  const featuredContractors = sortedContractors.filter(c => c.isFeatured);
  const regularContractors = sortedContractors.filter(c => !c.isFeatured);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Contractor Marketplace</h1>
        <p className="text-xl text-gray-600">Find verified, professional contractors for your home renovation projects</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search contractors, services, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg h-12"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase().replace(' ', '_')}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location.toLowerCase().replace(' ', '_')}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Availability</SelectItem>
                  <SelectItem value="available">Available Now</SelectItem>
                  <SelectItem value="busy">Busy (Limited)</SelectItem>
                  <SelectItem value="booked">Fully Booked</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="experience">Most Experience</SelectItem>
                  <SelectItem value="projects">Most Projects</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[ratingFilter]}
                    onValueChange={(value) => setRatingFilter(value[0])}
                    max={5}
                    min={0}
                    step={0.5}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12">{ratingFilter}+ ⭐</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <Switch checked={showFeaturedOnly} onCheckedChange={setShowFeaturedOnly} />
                  <span className="text-sm font-medium">Featured Only</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Switch checked={showVerifiedOnly} onCheckedChange={setShowVerifiedOnly} />
                  <span className="text-sm font-medium">Verified Only</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-gray-600">
          Showing {sortedContractors.length} contractors
          {searchQuery && ` for "${searchQuery}"`}
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">
            {featuredContractors.length} featured, {regularContractors.length} regular
          </span>
        </div>
      </div>

      {/* Featured Contractors */}
      {featuredContractors.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Featured Contractors</h2>
            <Badge className="bg-yellow-100 text-yellow-800">Premium Listings</Badge>
          </div>
          
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {featuredContractors.slice(0, 6).map((contractor) => (
              <ContractorCard 
                key={contractor.id} 
                contractor={contractor} 
                viewMode={viewMode}
                isSaved={savedContractors.includes(contractor.id)}
                onSave={() => handleSaveContractor(contractor.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Contractors */}
      {regularContractors.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Contractors</h2>
          
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {regularContractors.map((contractor) => (
              <ContractorCard 
                key={contractor.id} 
                contractor={contractor} 
                viewMode={viewMode}
                isSaved={savedContractors.includes(contractor.id)}
                onSave={() => handleSaveContractor(contractor.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {sortedContractors.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No contractors found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters to find more contractors.
          </p>
          <Button onClick={() => {
            setSearchQuery("");
            setSelectedCategory("all");
            setSelectedLocation("all");
            setRatingFilter(0);
            setAvailabilityFilter("all");
            setShowFeaturedOnly(false);
            setShowVerifiedOnly(false);
          }}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}

// Contractor Card Component
function ContractorCard({ 
  contractor, 
  viewMode, 
  isSaved, 
  onSave 
}: { 
  contractor: Contractor; 
  viewMode: 'grid' | 'list';
  isSaved: boolean;
  onSave: () => void;
}) {
  const cardContent = (
    <div className={`relative ${contractor.isFeatured ? 'ring-2 ring-yellow-400' : ''}`}>
      {contractor.isFeatured && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-yellow-500 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}

      <CardContent className={viewMode === 'grid' ? 'p-6' : 'p-4'}>
        {viewMode === 'grid' ? (
          // Grid View
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contractor.profileImage} />
                  <AvatarFallback>{contractor.companyName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">{contractor.companyName}</h3>
                  {getSubscriptionBadge(contractor.subscriptionTier)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSave}
                className={isSaved ? 'text-red-600' : 'text-gray-400'}
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{contractor.rating}</span>
                <span className="text-gray-600">({contractor.reviewCount})</span>
              </div>
              {contractor.isVerified && (
                <Badge variant="outline" className="text-green-700 border-green-300">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            <p className="text-gray-600 text-sm line-clamp-2">{contractor.description}</p>

            <div className="flex flex-wrap gap-1">
              {contractor.specialties.slice(0, 3).map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {contractor.specialties.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{contractor.specialties.length - 3} more
                </Badge>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{contractor.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Experience:</span>
                <span className="font-medium">{contractor.yearsExperience} years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Projects:</span>
                <span className="font-medium">{contractor.completedProjects}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge className={getAvailabilityColor(contractor.availability)}>
                {contractor.availability === 'available' && <CheckCircle className="h-3 w-3 mr-1" />}
                {contractor.availability === 'busy' && <Clock className="h-3 w-3 mr-1" />}
                {contractor.availability === 'booked' && <Calendar className="h-3 w-3 mr-1" />}
                {contractor.availability.charAt(0).toUpperCase() + contractor.availability.slice(1)}
              </Badge>
              <span className="text-sm text-gray-600">⚡ {contractor.responseTime}</span>
            </div>

            {contractor.promotions && contractor.promotions.length > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Flame className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">
                    {contractor.promotions[0].description}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Link href={`/contractors/${contractor.id}`}>
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </Link>
              <Button className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </div>
          </div>
        ) : (
          // List View
          <div className="flex items-center space-x-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={contractor.profileImage} />
              <AvatarFallback>{contractor.companyName[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="font-bold text-xl">{contractor.companyName}</h3>
                  {getSubscriptionBadge(contractor.subscriptionTier)}
                  {contractor.isVerified && (
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSave}
                  className={isSaved ? 'text-red-600' : 'text-gray-400'}
                >
                  <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                </Button>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{contractor.rating}</span>
                  <span className="text-gray-600">({contractor.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{contractor.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{contractor.completedProjects} projects</span>
                </div>
                <Badge className={getAvailabilityColor(contractor.availability)}>
                  {contractor.availability.charAt(0).toUpperCase() + contractor.availability.slice(1)}
                </Badge>
              </div>

              <p className="text-gray-600">{contractor.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {contractor.specialties.slice(0, 4).map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Link href={`/contractors/${contractor.id}`}>
                    <Button variant="outline">View Profile</Button>
                  </Link>
                  <Button>Contact</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );

  return (
    <Card className={`hover:shadow-lg transition-shadow ${contractor.isFeatured ? 'ring-1 ring-yellow-300' : ''}`}>
      {cardContent}
    </Card>
  );
}

// Helper function to generate mock contractor data
function generateMockContractors(): Contractor[] {
  const companies = [
    "Elite Renovations", "Premium Builders", "Craft Masters", "Home Experts", "Quality Works",
    "Precision Contractors", "Dream Builders", "Expert Renovators", "Master Craftsmen", "Pro Builders"
  ];

  const specialties = [
    ["Kitchen Renovation", "Custom Cabinets"],
    ["Bathroom Remodeling", "Tile Work"],
    ["Roofing", "Gutter Installation"],
    ["Flooring", "Hardwood Installation"],
    ["Painting", "Interior Design"],
    ["Electrical", "Smart Home"],
    ["Plumbing", "Fixture Installation"],
    ["HVAC", "Energy Efficiency"],
    ["Landscaping", "Outdoor Living"],
    ["General Contracting", "Home Additions"]
  ];

  const locations = [
    "San Francisco, CA", "Los Angeles, CA", "Seattle, WA", "Portland, OR", "San Diego, CA"
  ];

  const tiers = ['basic', 'pro', 'premium', 'enterprise'];
  const availabilities = ['available', 'busy', 'booked'];

  return companies.map((company, index) => ({
    id: index + 1,
    companyName: company,
    description: `Professional ${specialties[index][0].toLowerCase()} services with over ${5 + index} years of experience. We specialize in high-quality work and customer satisfaction.`,
    specialties: specialties[index],
    location: locations[index % locations.length],
    rating: 4.0 + (Math.random() * 1),
    reviewCount: Math.floor(Math.random() * 200) + 10,
    completedProjects: Math.floor(Math.random() * 100) + 20,
    yearsExperience: 5 + index,
    isVerified: Math.random() > 0.3,
    isFeatured: index < 3,
    isPremium: index < 5,
    responseTime: `${Math.floor(Math.random() * 4) + 1}h`,
    priceRange: "$50-150/hr",
    availability: availabilities[Math.floor(Math.random() * availabilities.length)] as any,
    subscriptionTier: tiers[Math.floor(Math.random() * tiers.length)] as any,
    profileImage: `https://images.unsplash.com/photo-${1500000000000 + index * 1000}?w=100&h=100&fit=crop&crop=face`,
    portfolioImages: [],
    certifications: ["Licensed", "Insured", "Bonded"],
    insuranceVerified: true,
    backgroundChecked: true,
    contactInfo: {
      phone: `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      email: `contact@${company.toLowerCase().replace(' ', '')}.com`,
      website: `https://${company.toLowerCase().replace(' ', '')}.com`
    },
    promotions: index < 2 ? [{
      type: 'discount' as const,
      description: '20% off first project',
      validUntil: '2024-12-31'
    }] : undefined,
    businessHours: {
      monday: "8:00 AM - 6:00 PM",
      tuesday: "8:00 AM - 6:00 PM",
      wednesday: "8:00 AM - 6:00 PM",
      thursday: "8:00 AM - 6:00 PM",
      friday: "8:00 AM - 6:00 PM",
      saturday: "9:00 AM - 4:00 PM",
      sunday: "Closed"
    },
    recentWork: [{
      projectType: specialties[index][0],
      completedDate: "2024-01-15",
      clientReview: "Excellent work and professional service!",
      rating: 5
    }]
  }));
} 