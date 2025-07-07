import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign, User, MessageCircle, Brain } from "lucide-react";
import BidCard from "@/components/bid-card";
import { AIAnalysis } from "@/components/ai-analysis";
import { AIDashboard } from "@/components/ai-dashboard";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import type { ProjectWithHomeowner } from "@/types/api";

export default function ProjectDetails() {
  const [, params] = useRoute("/project/:id");
  const projectId = parseInt(params?.id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: project, isLoading: projectLoading } = useQuery<ProjectWithHomeowner>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });

  const { data: bids = [], isLoading: bidsLoading } = useQuery<any[]>({
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
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept bid. Please try again.",
        variant: "destructive",
      });
    },
  });

  const timeAgo = (date: string | Date) => {
    const now = new Date();
    const projectDate = typeof date === 'string' ? new Date(date) : date;
    const diffTime = Math.abs(now.getTime() - projectDate.getTime());
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

  if (projectLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            </div>
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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          <Badge className={getCategoryColor(project.category)}>
            {project.category}
          </Badge>
        </div>
        <p className="text-gray-600">Posted {timeAgo(project.createdAt)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">{project.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-semibold">{project.budget}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Timeline</p>
                    <p className="font-semibold">{project.timeline}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold">{project.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Photos */}
          {project.photos && project.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Project Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {project.photos.map((photo: string, index: number) => (
                    <img
                      key={index}
                      src={`/api/uploads/${photo}`}
                      alt={`Project photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bids Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Bids Received ({bids.length})</span>
                <Link href={`/project/${projectId}/bids`}>
                  <Button variant="outline" size="sm">
                    Manage Bids
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bidsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : bids.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No bids received yet.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Contractors will start submitting bids soon.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bids.slice(0, 3).map((bid: any) => (
                    <BidCard
                      key={bid.id}
                      bid={bid}
                      onAccept={(bidId) => acceptBidMutation.mutate(bidId)}
                    />
                  ))}
                  {bids.length > 3 && (
                    <div className="text-center pt-4">
                      <Link href={`/project/${projectId}/bids`}>
                        <Button variant="outline">
                          View All {bids.length} Bids
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Analysis Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI Analysis & Recommendations
                <Link href={`/ai-recommendations/${projectId}`}>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIAnalysis 
                projectId={projectId} 
                onContractorSelect={(contractorId) => {
                  // Navigate to contractor profile
                  window.open(`/contractor/${contractorId}`, '_blank');
                }}
              />
            </CardContent>
          </Card>

          {/* AI Dashboard Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI-Powered Project Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIDashboard projectId={projectId} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Owner */}
          <Card>
            <CardHeader>
              <CardTitle>Project Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold">
                    {project.homeowner ? 
                      `${project.homeowner.firstName} ${project.homeowner.lastName}` : 
                      'Anonymous'
                    }
                  </p>
                  <p className="text-sm text-gray-500">Homeowner</p>
                </div>
              </div>
              <Button className="w-full" variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* Project Status */}
          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                    {project.status === 'open' ? 'Open for Bids' : project.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bids Received</span>
                  <span className="font-semibold">{bids.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Posted</span>
                  <span className="text-sm">{timeAgo(project.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/messaging/${projectId}`}>
                <Button className="w-full" variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  View Messages
                </Button>
              </Link>
              <Link href={`/project/${projectId}/bids`}>
                <Button className="w-full">
                  Manage Bids
                </Button>
              </Link>
              <Link href={`/ai-recommendations/${projectId}`}>
                <Button className="w-full" variant="outline">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Recommendations
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
