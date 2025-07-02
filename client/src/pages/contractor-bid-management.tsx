import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { BID_STATUS } from "@/lib/constants";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ContractorBidManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Load contractor bids
  const { data: bids = [] } = useQuery({
    queryKey: ["/api/contractors/1/bids"],
  });

  const updateBidMutation = useMutation({
    mutationFn: async ({ bidId, status }: { bidId: number; status: string }) => {
      return apiRequest("PUT", `/api/bids/${bidId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contractors/1/bids"] });
      toast({
        title: "Success",
        description: "Bid status updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to update bid status",
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

  const getBidStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
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

  const filteredBids = (bids as any[]).filter((bid: any) => {
    if (activeTab === "all") return true;
    return bid.status === activeTab;
  });

  const pendingBids = (bids as any[]).filter((bid: any) => bid.status === 'pending');
  const acceptedBids = (bids as any[]).filter((bid: any) => bid.status === 'accepted');
  const rejectedBids = (bids as any[]).filter((bid: any) => bid.status === 'rejected');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Bids</h1>
        <p className="text-xl text-gray-600">Track and manage your project bids</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-md bg-blue-100 p-3">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bids</p>
                <p className="text-2xl font-bold text-gray-900">{(bids as any[]).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-md bg-yellow-100 p-3">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingBids.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-md bg-green-100 p-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">{acceptedBids.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-md bg-red-100 p-3">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{rejectedBids.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bids List */}
      <Card>
        <CardHeader>
          <CardTitle>All Bids</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({(bids as any[]).length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingBids.length})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({acceptedBids.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedBids.length})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredBids.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bids found</h3>
                  <p className="text-gray-600">
                    {activeTab === "all" 
                      ? "You haven't submitted any bids yet." 
                      : `No ${activeTab} bids at the moment.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBids.map((bid: any) => (
                    <Card key={bid.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {bid.project?.title || "Project Title"}
                              </h3>
                              <Badge className={getCategoryColor(bid.project?.category || "")}>
                                {bid.project?.category}
                              </Badge>
                              <Badge className={getBidStatusColor(bid.status)}>
                                <div className="flex items-center space-x-1">
                                  {getBidStatusIcon(bid.status)}
                                  <span className="capitalize">{bid.status}</span>
                                </div>
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {bid.proposal}
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <div>
                                  <p className="text-xs text-gray-500">Bid Amount</p>
                                  <p className="font-semibold">${bid.amount}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <div>
                                  <p className="text-xs text-gray-500">Timeline</p>
                                  <p className="font-semibold">{bid.timeline}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-purple-600" />
                                <div>
                                  <p className="text-xs text-gray-500">Submitted</p>
                                  <p className="font-semibold">{timeAgo(bid.createdAt)}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-gray-600" />
                                <div>
                                  <p className="text-xs text-gray-500">Location</p>
                                  <p className="font-semibold">{bid.project?.homeowner?.city || "N/A"}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" asChild>
                              <a href={`/project-details/${bid.project?.id}`}>
                                View Project
                              </a>
                            </Button>
                            <Button size="sm" asChild>
                              <a href="/messaging">
                                Contact Client
                              </a>
                            </Button>
                          </div>
                          
                          {bid.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBidMutation.mutate({ bidId: bid.id, status: "withdrawn" })}
                                disabled={updateBidMutation.isPending}
                              >
                                Withdraw Bid
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}