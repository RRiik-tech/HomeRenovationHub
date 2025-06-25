import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import type { Contractor } from "@shared/schema";

interface ContractorCardProps {
  contractor: Contractor & {
    user?: any;
  };
}

export default function ContractorCard({ contractor }: ContractorCardProps) {
  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i < Math.floor(numRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
        />
      );
    }
    return stars;
  };

  return (
    <Link href={`/contractors/${contractor.id}`}>
      <Card className="hover-lift overflow-hidden border cursor-pointer">
        <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          {contractor.user?.firstName && contractor.user?.lastName ? (
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {contractor.user.firstName[0]}{contractor.user.lastName[0]}
              </span>
            </div>
          ) : (
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-600">?</span>
            </div>
          )}
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {contractor.user ? `${contractor.user.firstName} ${contractor.user.lastName}` : 'Unknown'}
            </h3>
            <div className="flex items-center">
              <div className="flex">
                {renderStars(contractor.rating)}
              </div>
              <span className="text-gray-500 text-sm ml-1">{contractor.rating}</span>
            </div>
          </div>
          
          <p className="text-orange-600 font-medium mb-2">{contractor.companyName}</p>
          <p className="text-gray-600 text-sm mb-4">{contractor.experienceYears}+ years experience</p>
          
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {contractor.specialties.slice(0, 2).map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {contractor.specialties.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{contractor.specialties.length - 2} more
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 text-sm">
                {contractor.user ? `${contractor.user.city}, ${contractor.user.state}` : 'Location unknown'}
              </span>
            </div>
            {contractor.isVerified && (
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-600 text-sm font-medium">Verified</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
