import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Home, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Edit,
  Plus,
  MessageSquare,
  Star,
  Calendar,
  FileText,
  Settings,
  Phone,
  Mail,
  Briefcase,
  Award,
  BarChart3,
  UserCheck,
  Search,
  Filter,
  Handshake,
  ClipboardList,
  Save
} from "lucide-react";
import { Link } from "wouter";

interface UserProject {
  id: number;
  homeownerId: number;
  title: string;
  description: string;
  category: string;
  budget: string;
  timeline: string;
  address: string;
  photos: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  bidCount: number;
  bids: ProjectBid[];
}

interface ProjectBid {
  id: number;
  projectId: number;
  contractorId: number;
  amount: number;
  timeline: string;
  proposal: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  project?: {
    id: number;
    title: string;
    category: string;
  };
  contractor: {
    id: number;
    companyName: string;
    specialties: string[];
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      photoURL?: string | null;
    };
  };
}

interface ContractorConnection {
  id: number;
  contractorId: number;
  projectId: number;
  status: 'connected' | 'messaging' | 'working' | 'completed';
  startDate: string;
  endDate?: string;
  contractor: {
    id: number;
    companyName: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      photoURL?: string;
    };
  };
  project: {
    id: number;
    title: string;
    category: string;
  };
}

export default function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || ''
  });

  // Fetch user's projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['user-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const response = await fetch(`/api/users/${user.id}/projects`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch contractor connections
  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ['user-connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const response = await fetch(`/api/users/${user.id}/contractor-connections`);
      if (!response.ok) throw new Error('Failed to fetch connections');
      
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Accept/Reject bid mutation
  const updateBidStatus = useMutation({
    mutationFn: async ({ bidId, status }: { bidId: number; status: 'accepted' | 'rejected' }) => {
      const response = await fetch(`/api/bids/${bidId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) throw new Error('Failed to update bid status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-projects'] });
      toast({
        title: "Success",
        description: "Bid status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update project status
  const updateProjectStatus = useMutation({
    mutationFn: async ({ projectId, status }: { projectId: number; status: string }) => {
      const response = await fetch(`/api/projects/${projectId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) throw new Error('Failed to update project status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-projects'] });
      toast({
        title: "Success",
        description: "Project status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (updatedData: any) => {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setEditingProfile(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h1>
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (projectsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'open':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openProjects = projects.filter((project: UserProject) => project.status === 'open');
  const inProgressProjects = projects.filter((project: UserProject) => project.status === 'in_progress');
  const completedProjects = projects.filter((project: UserProject) => project.status === 'completed');
  const totalBids = projects.reduce((sum: number, project: UserProject) => sum + project.bidCount, 0);
  const pendingBids = projects.reduce((sum: number, project: UserProject) => 
    sum + project.bids.filter((bid: ProjectBid) => bid.status === 'pending').length, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback>
              {user.firstName[0]}{user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user.firstName}!</h1>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center mt-1">
              <Home className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm text-gray-500">{user.city}, {user.state}</span>
            </div>
          </div>
        </div>
        <Button onClick={() => setEditingProfile(!editingProfile)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">{openProjects.length} active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Bids</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBids}</div>
            <p className="text-xs text-muted-foreground">{totalBids} total received</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contractors</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connections.length}</div>
            <p className="text-xs text-muted-foreground">Connected contractors</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects.length}</div>
            <p className="text-xs text-muted-foreground">Finished projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="bids">New Bids</TabsTrigger>
          <TabsTrigger value="contractors">Contractors</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2" />
                  Recent Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project: UserProject) => (
                    <div key={project.id} className="flex justify-between items-start p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{project.title}</h4>
                        <p className="text-sm text-gray-600">{project.category}</p>
                        <p className="text-sm text-gray-500">{project.bidCount} bids received</p>
                      </div>
                      <Badge className={getProjectStatusColor(project.status)}>
                        {getStatusIcon(project.status)}
                        <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No projects yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Bids */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  Recent Bids
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.flatMap((project: UserProject) => 
                    project.bids.filter((bid: ProjectBid) => bid.status === 'pending').slice(0, 3)
                      .map((bid: ProjectBid) => (
                        <div key={bid.id} className="flex justify-between items-start p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{bid.contractor.companyName}</h4>
                            <p className="text-sm text-gray-600">For: {project.title}</p>
                            <p className="text-sm font-medium text-green-600">${bid.amount.toLocaleString()}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => updateBidStatus.mutate({ bidId: bid.id, status: 'accepted' })}
                            >
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateBidStatus.mutate({ bidId: bid.id, status: 'rejected' })}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))
                  )}
                  {pendingBids === 0 && (
                    <p className="text-gray-500 text-center py-4">No new bids</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild className="h-20 flex-col">
                  <Link href="/post-project">
                    <Plus className="h-6 w-6 mb-2" />
                    Post New Project
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href="/find-contractors">
                    <Search className="h-6 w-6 mb-2" />
                    Find Contractors
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href="/messaging">
                    <MessageSquare className="h-6 w-6 mb-2" />
                    Messages
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Projects</h2>
            <Button asChild>
              <Link href="/post-project">
                <Plus className="h-4 w-4 mr-2" />
                Add New Project
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {projects.map((project: UserProject) => (
              <Card key={project.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                      <p className="text-gray-600 mb-2">{project.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {project.address}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {project.timeline}
                        </span>
                        <Badge variant="outline">{project.category}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getProjectStatusColor(project.status)}>
                        {getStatusIcon(project.status)}
                        <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        Posted {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Budget</p>
                        <p className="font-medium">{project.budget}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bids Received</p>
                        <p className="font-medium">{project.bidCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Timeline</p>
                        <p className="font-medium">{project.timeline}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                          <Link href={`/projects/${project.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                        {project.bidCount > 0 && (
                          <Button variant="outline" asChild>
                            <Link href={`/projects/${project.id}/bids`}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              View Bids ({project.bidCount})
                            </Link>
                          </Button>
                        )}
                      </div>
                      
                      {project.status === 'open' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateProjectStatus.mutate({ projectId: project.id, status: 'closed' })}
                        >
                          Close Project
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {projects.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Post your first project to get started</p>
                <Button asChild>
                  <Link href="/post-project">Create Project</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Bids Tab */}
        <TabsContent value="bids" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">New Bids</h2>
            <Badge variant="outline">{pendingBids} Pending Review</Badge>
          </div>

          <div className="space-y-4">
            {projects.map((project: UserProject) => 
              project.bids.filter((bid: ProjectBid) => bid.status === 'pending').map((bid: ProjectBid) => (
                <Card key={bid.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={bid.contractor.user.photoURL || undefined} />
                            <AvatarFallback>
                              {bid.contractor.user.firstName[0]}{bid.contractor.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{bid.contractor.companyName}</h3>
                            <p className="text-sm text-gray-600">
                              {bid.contractor.user.firstName} {bid.contractor.user.lastName}
                            </p>
                          </div>
                          {bid.contractor.isVerified && (
                            <Badge variant="secondary">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Project: {project.title}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{bid.contractor.rating.toFixed(1)}</span>
                            <span className="text-gray-500 ml-1">({bid.contractor.reviewCount} reviews)</span>
                          </div>
                          <span className="text-gray-500">•</span>
                          <span>{bid.contractor.specialties.join(', ')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">${bid.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Timeline: {bid.timeline}</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 mb-4">
                      <h4 className="font-medium mb-2">Proposal</h4>
                      <p className="text-sm text-gray-600">{bid.proposal}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                          <Link href={`/contractors/${bid.contractor.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={`/messaging/${project.id}?contractor=${bid.contractor.id}`}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Link>
                        </Button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => updateBidStatus.mutate({ bidId: bid.id, status: 'accepted' })}
                          disabled={updateBidStatus.isPending}
                        >
                          Accept Bid
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => updateBidStatus.mutate({ bidId: bid.id, status: 'rejected' })}
                          disabled={updateBidStatus.isPending}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          {pendingBids === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No new bids</h3>
                <p className="text-gray-600 mb-4">Check back later for new contractor proposals</p>
                <Button asChild>
                  <Link href="/post-project">Post Another Project</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Contractors Tab */}
        <TabsContent value="contractors" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Connected Contractors</h2>
            <Button asChild>
              <Link href="/find-contractors">
                <Search className="h-4 w-4 mr-2" />
                Find More Contractors
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((connection: ContractorConnection) => (
              <Card key={connection.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={connection.contractor.user.photoURL || undefined} />
                      <AvatarFallback>
                        {connection.contractor.user.firstName[0]}{connection.contractor.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{connection.contractor.companyName}</h3>
                      <p className="text-sm text-gray-600">
                        {connection.contractor.user.firstName} {connection.contractor.user.lastName}
                      </p>
                      {connection.contractor.isVerified && (
                        <Badge variant="secondary" className="mt-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Rating:</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{connection.contractor.rating.toFixed(1)}</span>
                        <span className="text-gray-500 ml-1">({connection.contractor.reviewCount})</span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Project:</span>
                      <span className="ml-2">{connection.project.title}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Status:</span>
                      <Badge variant="outline" className="ml-2">
                        {connection.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/contractors/${connection.contractor.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/messaging/${connection.project.id}?contractor=${connection.contractor.id}`}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {connections.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Handshake className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No contractor connections yet</h3>
                <p className="text-gray-600 mb-4">Accept bids on your projects to connect with contractors</p>
                <Button asChild>
                  <Link href="/find-contractors">Browse Contractors</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <h2 className="text-2xl font-bold">Profile & Account Settings</h2>
          
          {editingProfile ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={profileData.state}
                      onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={() => updateProfile.mutate(profileData)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingProfile(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Name:</span>
                    <span>{user.firstName} {user.lastName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Email:</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Phone:</span>
                    <span>{user.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Address:</span>
                    <span>{user.address}, {user.city}, {user.state}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Account Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Account Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Projects Posted:</span>
                    <span className="font-medium">{projects.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Bids Received:</span>
                    <span className="font-medium">{totalBids}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Completed Projects:</span>
                    <span className="font-medium">{completedProjects.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Connected Contractors:</span>
                    <span className="font-medium">{connections.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Member Since:</span>
                    <span className="font-medium">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 