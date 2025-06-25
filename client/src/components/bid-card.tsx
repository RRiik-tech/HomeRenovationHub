import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Clock, DollarSign } from "lucide-react";
import type { Bid } from "@shared/schema";

interface BidCardProps {
  bid: Bid & {
    contractor?: any;
  };
  onAccept?: (bidId: number) => void;
  onReject?: (bidId: number) => void;
}

export default function BidCard({ bid, onAccept, onReject }: BidCardProps) {
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

  const timeAgo = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.ceil(diffHours / 24);
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  return (
    <Card className="hover:bg-gray-50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center">
              {bid.contractor?.user ? (
                <span className="text-lg font-bold text-primary">
                  {bid.contractor.user.firstName[0]}{bid.contractor.user.lastName[0]}
                </span>
              ) : (
                <span className="text-lg font-bold text-gray-600">?</span>
              )}
            </div>
            
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {bid.contractor?.user ? 
                  `${bid.contractor.user.firstName} ${bid.contractor.user.lastName}` : 
                  'Unknown Contractor'
                }
              </h4>
              <p className="text-orange-600 font-medium mb-2">{bid.contractor?.companyName}</p>
              
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center">
                  <div className="flex">
                    {renderStars(bid.contractor?.rating || "0")}
                  </div>
                  <span className="text-gray-500 text-sm ml-1">
                    {bid.contractor?.rating} ({bid.contractor?.reviewCount} reviews)
                  </span>
                </div>
                <span className="text-gray-500 text-sm">
                  {bid.contractor?.experienceYears}+ years exp
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{bid.proposal}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Submitted {timeAgo(bid.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right ml-6">
            <div className="flex items-center space-x-1 mb-1">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {parseFloat(bid.amount).toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-4">{bid.timeline}</div>
            
            {bid.status === 'pending' && onAccept && onReject && (
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  View Details
                </Button>
                <Button 
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => onAccept(bid.id)}
                >
                  Accept Bid
                </Button>
              </div>
            )}
            
            {bid.status === 'accepted' && (
              <Badge className="bg-green-100 text-green-800">Accepted</Badge>
            )}
            
            {bid.status === 'rejected' && (
              <Badge className="bg-red-100 text-red-800">Rejected</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
