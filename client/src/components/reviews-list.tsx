import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, User } from "lucide-react";

interface Review {
  id: number;
  rating: number;
  comment: string;
  categories: string[];
  createdAt: string;
  reviewer: {
    firstName: string;
    lastName: string;
  };
  project?: {
    title: string;
  };
}

interface ReviewsListProps {
  reviews: Review[];
  title?: string;
}

const categoryLabels: { [key: string]: string } = {
  quality: "Quality of Work",
  communication: "Communication",
  timeliness: "Timeliness",
  professionalism: "Professionalism",
  value: "Value for Money",
};

export default function ReviewsList({ reviews, title = "Reviews" }: ReviewsListProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Be the first to leave a review!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          {title} ({reviews.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {review.reviewer.firstName} {review.reviewer.lastName}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                  <span className="text-sm font-medium text-gray-900 ml-1">
                    {review.rating}.0
                  </span>
                </div>
              </div>

              {/* Project info if available */}
              {review.project && (
                <div className="mb-3">
                  <Badge variant="outline" className="text-xs">
                    {review.project.title}
                  </Badge>
                </div>
              )}

              {/* Categories */}
              {review.categories.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {review.categories.map((category) => (
                      <Badge 
                        key={category} 
                        variant="secondary" 
                        className="text-xs bg-green-100 text-green-800"
                      >
                        {categoryLabels[category] || category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Comment */}
              <p className="text-gray-700 leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 