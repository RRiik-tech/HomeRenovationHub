import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, Clock, User } from "lucide-react";
import BidCard from "@/components/bid-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function BidManagement() {
  const [, params] = useRoute("/project/:id/bids");
  const projectId = parseInt(params?.id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });

  const { data: bids = [], isLoading: bidsLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/bids`],
    enabled: !!projectId,
  });

  const acceptBidMutation = useMutation({
    mutationFn: async (bidId: number) => {
      await apiRequest("PUT", `/api/bids/${bidId}/status`, { status: "accepted" });
    },
    onSuccess: () => {
      toast({
        title: "Bid Accepted",
        description: "The contractor has been notified and will contact you soon.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/bids`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept bid. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectBidMutation = useMutation({
    mutationFn: async (bidId: number) => {
      await apiRequest("PUT", `/api/bids/${bidId}/status`, { status: "rejected" });
    },
    onSuccess: () => {
      toast({
        title: "Bid Rejected",
        description: "The contractor has been notified.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/bids`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject bid. Please try again.",
        variant: "destructive",
      });
    },
  });

  const timeAgo = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      "Kitchen Remodeling": "bg-indigo-100 text-indigo-800",
      "Bathroom Renovation": "bg-pink-100 text-pink-800", 
      "Roofing": "bg-green-100 text-green-800",
      "Plumbing": "bg-blue-100 text-blue-800",
      "Electrical": "bg-orange-100 text-orange-800",
    };
    return colorMap[category] || "bg-gray-100 text-gray-800";
  };

  const pendingBids = (bids as any[]).filter((bid: any) => bid.status === 'pending');
  const acceptedBids = (bids as any[]).filter((bid: any) => bid.status === 'accepted');
  const rejectedBids = (bids as any[]).filter((bid: any) => bid.status === 'rejected');

  if (projectLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
            <p className="text-gray-600">The project you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link href={`/project/${projectId}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Project
          </Button>
        </Link>
      </div>

      {/* Project Header */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="hero-gradient px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{(project as any).title}</h1>
              <p className="text-blue-100">
                Posted {timeAgo((project as any).createdAt)} • {(bids as any[]).length} bid{(bids as any[]).length !== 1 ? 's' : ''} received
              </p>
            </div>
            <Badge className={`${getCategoryColor((project as any).category)} border-0`}>
              {(project as any).category}
            </Badge>
          </div>
        </div>

        {/* Project Summary */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Budget</p>
                <p className="font-semibold text-lg">{(project as any).budget}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Timeline</p>
                <p className="font-semibold text-lg">{(project as any).timeline}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Total Bids</p>
                <p className="font-semibold text-lg">{(bids as any[]).length}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold">!</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="font-semibold text-lg">{pendingBids.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bid Sections */}
      <div className="space-y-8">
        {/* Pending Bids */}
        {pendingBids.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending Bids ({pendingBids.length})</span>
                <Badge variant="outline">{pendingBids.length} awaiting review</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bidsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBids.map((bid: any) => (
                    <BidCard
                      key={bid.id}
                      bid={bid}
                      onAccept={(bidId) => acceptBidMutation.mutate(bidId)}
                      onReject={(bidId) => rejectBidMutation.mutate(bidId)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Accepted Bids */}
        {acceptedBids.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Accepted Bids ({acceptedBids.length})</span>
                <Badge className="bg-green-100 text-green-800">Approved</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {acceptedBids.map((bid: any) => (
                  <BidCard key={bid.id} bid={bid} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rejected Bids */}
        {rejectedBids.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Rejected Bids ({rejectedBids.length})</span>
                <Badge variant="destructive">Declined</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rejectedBids.map((bid: any) => (
                  <BidCard key={bid.id} bid={bid} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Bids State */}
        {(bids as any[]).length === 0 && !bidsLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bids Yet</h3>
              <p className="text-gray-600 mb-6">
                Your project is live and contractors will start submitting bids soon.
              </p>
              <div className="flex justify-center space-x-4">
                <Link href={`/project/${projectId}`}>
                  <Button variant="outline">View Project</Button>
                </Link>
                <Link href="/find-contractors">
                  <Button>Browse Contractors</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
