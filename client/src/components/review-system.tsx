import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Camera, 
  Shield, 
  Clock, 
  DollarSign, 
  MessageSquare, 
  Award,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Upload,
  X
} from "lucide-react";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100),
  comment: z.string().min(10).max(1000),
  categories: z.object({
    quality: z.number().min(1).max(5),
    timeliness: z.number().min(1).max(5),
    communication: z.number().min(1).max(5),
    professionalism: z.number().min(1).max(5),
    value: z.number().min(1).max(5),
  }),
  wouldRecommend: z.boolean(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface Review {
  id: number;
  projectId: number;
  contractorId: number;
  reviewerId: number;
  rating: number;
  title: string;
  comment: string;
  photos: string[];
  categories: {
    quality: number;
    timeliness: number;
    communication: number;
    professionalism: number;
    value: number;
  };
  wouldRecommend: boolean;
  isVerified: boolean;
  createdAt: string;
  reviewer?: {
    firstName: string;
    lastName: string;
    photoURL?: string;
  };
  project?: {
    title: string;
    category: string;
  };
}

interface ReviewSystemProps {
  projectId?: number;
  contractorId?: number;
  canReview?: boolean;
  showReviewForm?: boolean;
}

export function ReviewSystem({ projectId, contractorId, canReview = false, showReviewForm = false }: ReviewSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(showReviewForm);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState("reviews");

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      title: "",
      comment: "",
      categories: {
        quality: 5,
        timeliness: 5,
        communication: 5,
        professionalism: 5,
        value: 5,
      },
      wouldRecommend: true,
    },
  });

  // Fetch reviews
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', projectId ? `project-${projectId}` : `contractor-${contractorId}`],
    queryFn: async () => {
      const url = projectId 
        ? `/api/projects/${projectId}/reviews`
        : `/api/contractors/${contractorId}/reviews`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    },
    enabled: !!(projectId || contractorId),
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const formData = new FormData();
      
      // Append review data
      formData.append('projectId', projectId?.toString() || '');
      formData.append('contractorId', contractorId?.toString() || '');
      formData.append('reviewerId', user?.id?.toString() || '');
      formData.append('rating', data.rating.toString());
      formData.append('title', data.title);
      formData.append('comment', data.comment);
      formData.append('categories', JSON.stringify(data.categories));
      formData.append('wouldRecommend', data.wouldRecommend.toString());
      
      // Append photos
      uploadedPhotos.forEach((photo, index) => {
        formData.append(`photos`, photo);
      });

      const response = await fetch('/api/reviews', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Your review has been submitted successfully!",
      });
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', projectId ? `project-${projectId}` : `contractor-${contractorId}`] 
      });
      setShowForm(false);
      form.reset();
      setUploadedPhotos([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos = Array.from(files).slice(0, 5 - uploadedPhotos.length);
      setUploadedPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: ReviewFormData) => {
    submitReviewMutation.mutate(data);
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5"
    };

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingBar = (label: string, value: number, total: number) => (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium w-16">{label}</span>
      <Progress value={(value / total) * 100} className="flex-1" />
      <span className="text-sm text-gray-600 w-8">{value}</span>
    </div>
  );

  // Calculate average ratings
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const avgCategories = reviews.length > 0 ? {
    quality: reviews.reduce((sum: number, review: Review) => sum + review.categories.quality, 0) / reviews.length,
    timeliness: reviews.reduce((sum: number, review: Review) => sum + review.categories.timeliness, 0) / reviews.length,
    communication: reviews.reduce((sum: number, review: Review) => sum + review.categories.communication, 0) / reviews.length,
    professionalism: reviews.reduce((sum: number, review: Review) => sum + review.categories.professionalism, 0) / reviews.length,
    value: reviews.reduce((sum: number, review: Review) => sum + review.categories.value, 0) / reviews.length,
  } : null;

  const recommendationRate = reviews.length > 0 
    ? (reviews.filter((review: Review) => review.wouldRecommend).length / reviews.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Review Summary
            <Badge variant="secondary">{reviews.length} reviews</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
                <div className="flex justify-center mt-1">
                  {renderStars(Math.round(avgRating), "lg")}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Based on {reviews.length} reviews
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">
                  {recommendationRate.toFixed(0)}% recommend
                </span>
              </div>
            </div>

            {/* Category Breakdown */}
            {avgCategories && (
              <div className="space-y-3">
                {renderRatingBar("Quality", avgCategories.quality, 5)}
                {renderRatingBar("Timeliness", avgCategories.timeliness, 5)}
                {renderRatingBar("Communication", avgCategories.communication, 5)}
                {renderRatingBar("Professional", avgCategories.professionalism, 5)}
                {renderRatingBar("Value", avgCategories.value, 5)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {canReview && (
        <Card>
          <CardHeader>
            <CardTitle>Leave a Review</CardTitle>
          </CardHeader>
          <CardContent>
            {!showForm ? (
              <Button onClick={() => setShowForm(true)} className="w-full">
                Write a Review
              </Button>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Overall Rating */}
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overall Rating</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => field.onChange(star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    star <= field.value 
                                      ? "fill-yellow-400 text-yellow-400" 
                                      : "text-gray-300 hover:text-yellow-400"
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-600">
                              {field.value} star{field.value !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category Ratings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(form.watch("categories")).map(([category, value]) => (
                      <FormField
                        key={category}
                        control={form.control}
                        name={`categories.${category as keyof ReviewFormData['categories']}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="capitalize">{category}</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => field.onChange(star)}
                                    className="focus:outline-none"
                                  >
                                    <Star
                                      className={`h-4 w-4 ${
                                        star <= field.value 
                                          ? "fill-yellow-400 text-yellow-400" 
                                          : "text-gray-300 hover:text-yellow-400"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>

                  {/* Review Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Summarize your experience..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Review Comment */}
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Review</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share your detailed experience..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Photos (Optional)</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                          <Camera className="h-4 w-4" />
                          <span className="text-sm">Add Photos</span>
                        </div>
                      </label>
                      <span className="text-xs text-gray-500">
                        {uploadedPhotos.length}/5 photos
                      </span>
                    </div>
                    
                    {uploadedPhotos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {uploadedPhotos.map((photo, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Upload ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recommendation */}
                  <FormField
                    control={form.control}
                    name="wouldRecommend"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Would you recommend this contractor?</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-4">
                            <button
                              type="button"
                              onClick={() => field.onChange(true)}
                              className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                                field.value 
                                  ? 'bg-green-50 border-green-500 text-green-700' 
                                  : 'bg-gray-50 border-gray-300 text-gray-700'
                              }`}
                            >
                              <ThumbsUp className="h-4 w-4" />
                              <span>Yes</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange(false)}
                              className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                                !field.value 
                                  ? 'bg-red-50 border-red-500 text-red-700' 
                                  : 'bg-gray-50 border-gray-300 text-gray-700'
                              }`}
                            >
                              <ThumbsDown className="h-4 w-4" />
                              <span>No</span>
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      disabled={submitReviewMutation.isPending}
                      className="flex-1"
                    >
                      {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No reviews yet. Be the first to leave a review!
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review: Review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.reviewer?.photoURL} />
                      <AvatarFallback>
                        {review.reviewer?.firstName?.[0]}{review.reviewer?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {review.reviewer?.firstName} {review.reviewer?.lastName}
                            </span>
                            {review.isVerified && (
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-600">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {review.wouldRecommend ? (
                            <Badge variant="secondary" className="text-green-700 bg-green-50">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              Recommends
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-red-700 bg-red-50">
                              <ThumbsDown className="h-3 w-3 mr-1" />
                              Not Recommended
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <h4 className="font-medium mt-2">{review.title}</h4>
                      <p className="text-gray-700 mt-1">{review.comment}</p>
                      
                      {/* Category Ratings */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
                        {Object.entries(review.categories).map(([category, rating]) => (
                          <div key={category} className="text-center">
                            <div className="text-xs text-gray-500 capitalize">{category}</div>
                            <div className="flex justify-center mt-1">
                              {renderStars(rating, "sm")}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Photos */}
                      {review.photos && review.photos.length > 0 && (
                        <div className="flex space-x-2 mt-3">
                          {review.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Review photo ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 