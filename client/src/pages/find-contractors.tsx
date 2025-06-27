import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ContractorCard from "@/components/contractor-card";
import { PROJECT_CATEGORIES } from "@/lib/constants";
import { Search, Filter, MapPin, Loader2, AlertCircle } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useToast } from "@/hooks/use-toast";

export default function FindContractors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [useLocation, setUseLocation] = useState(false);
  const [radiusKm, setRadiusKm] = useState(20);
  
  const { coordinates, isLoading: locationLoading, error: locationError, requestLocation } = useGeolocation();
  const { toast } = useToast();

  // Build query parameters for API call
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (useLocation && coordinates) {
      params.append('latitude', coordinates.latitude.toString());
      params.append('longitude', coordinates.longitude.toString());
      params.append('radius', radiusKm.toString());
    }
    return params.toString();
  };

  const { data: contractors = [], isLoading } = useQuery({
    queryKey: ["/api/contractors", buildQueryParams()],
    refetchOnWindowFocus: false,
  });

  // Auto-enable location when coordinates are available
  useEffect(() => {
    if (coordinates && !useLocation) {
      setUseLocation(true);
      toast({
        title: "Location Found",
        description: `Showing contractors within ${radiusKm}km of your location`,
      });
    }
  }, [coordinates, useLocation, radiusKm, toast]);

  const filteredContractors = contractors.filter((contractor: any) => {
    const matchesSearch = !searchTerm || 
      contractor.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.specialties?.some((specialty: string) => 
        specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory = !selectedCategory || selectedCategory === "all" ||
      contractor.specialties?.some((specialty: string) => 
        specialty.toLowerCase().includes(selectedCategory.toLowerCase())
      );

    const matchesLocation = !selectedLocation ||
      contractor.user?.city?.toLowerCase().includes(selectedLocation.toLowerCase()) ||
      contractor.user?.state?.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Contractors</h1>
        <p className="text-xl text-gray-600">Connect with verified professionals for your project</p>
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Location Section */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Location-Based Search</span>
                </div>
                {coordinates && (
                  <Badge className="bg-green-100 text-green-800">
                    Location Found
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {!coordinates && (
                  <Button
                    onClick={requestLocation}
                    disabled={locationLoading}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    {locationLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 mr-2" />
                        Use My Location
                      </>
                    )}
                  </Button>
                )}
                
                {coordinates && (
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={useLocation}
                        onChange={(e) => setUseLocation(e.target.checked)}
                        className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-blue-700">Search within {radiusKm}km</span>
                    </label>
                    
                    <Select value={radiusKm.toString()} onValueChange={(value) => setRadiusKm(parseInt(value))}>
                      <SelectTrigger className="w-24 h-8 border-blue-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5km</SelectItem>
                        <SelectItem value="10">10km</SelectItem>
                        <SelectItem value="20">20km</SelectItem>
                        <SelectItem value="50">50km</SelectItem>
                        <SelectItem value="100">100km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              {locationError && (
                <div className="mt-3 flex items-center space-x-2 text-amber-700 bg-amber-50 p-2 rounded">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{locationError}</span>
                </div>
              )}
            </div>

            {/* Search and Category Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search contractors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {PROJECT_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <Input
                  placeholder="Location (city, state)"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {selectedCategory ? `${selectedCategory} Contractors` : 'All Contractors'}
            </h2>
            {useLocation && coordinates && (
              <p className="text-sm text-blue-600 mt-1">
                Showing contractors within {radiusKm}km of your location
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Filter className="w-4 h-4" />
            <span>{filteredContractors.length} contractors found</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredContractors.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No contractors found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or browse all categories.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredContractors.map((contractor: any) => (
            <ContractorCard key={contractor.id} contractor={contractor} />
          ))}
        </div>
      )}
    </div>
  );
}
