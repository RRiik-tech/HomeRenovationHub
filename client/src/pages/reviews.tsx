import { ReviewSystem } from "@/components/review-system";
import { useAuth } from "@/hooks/use-auth";

export default function ReviewsPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reviews & Ratings</h1>
          <p className="text-gray-600">Manage and view all project reviews and contractor ratings</p>
        </div>
        
        <ReviewSystem 
          projectId={1} // Demo project ID
          contractorId={1} // Demo contractor ID
        />
      </div>
    </div>
  );
} 