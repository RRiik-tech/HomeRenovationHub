import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ReviewFormProps {
  projectId: number;
  contractorId: number;
  reviewerId: number;
  onReviewSubmitted?: () => void;
  onCancel?: () => void;
}

const reviewCategories = [
  { id: "quality", label: "Quality of Work" },
  { id: "communication", label: "Communication" },
  { id: "timeliness", label: "Timeliness" },
  { id: "professionalism", label: "Professionalism" },
  { id: "value", label: "Value for Money" },
];

export default function ReviewForm({ 
  projectId, 
  contractorId, 
  reviewerId, 
  onReviewSubmitted,
  onCancel 
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please provide a comment about your experience.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/reviews", {
        projectId,
        contractorId,
        reviewerId,
        rating,
        comment: comment.trim(),
        categories: selectedCategories,
      });

      toast({
        title: "Review Submitted",
        description: "Thank you for your review!",
      });

      onReviewSubmitted?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Write a Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Stars */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Overall Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-colors"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? "text-yellow-500 fill-current"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {rating > 0 && `${rating} out of 5`}
            </span>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <label className="text-sm font-medium">What went well? (Optional)</label>
          <div className="flex flex-wrap gap-2">
            {reviewCategories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  selectedCategories.includes(category.id)
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleCategoryToggle(category.id)}
              >
                {selectedCategories.includes(category.id) && (
                  <Check className="w-3 h-3 mr-1" />
                )}
                {category.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label htmlFor="comment" className="text-sm font-medium">
            Your Review
          </label>
          <Textarea
            id="comment"
            placeholder="Share your experience with this contractor..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || !comment.trim()}
            className="flex-1"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 