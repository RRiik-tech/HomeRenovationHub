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
  Save,
  FolderOpen,
  FolderClosed
} from "lucide-react";
import { Link } from "wouter";
import type { Project } from "@shared/schema";

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
  const [projectTab, setProjectTab] = useState("open");
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
  const { data: projects = [], isLoading: projectsLoading, refetch: refetchProjects } = useQuery({
    queryKey: ['user-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Add timestamp to force fresh request and disable all caching
      const timestamp = Date.now();
      const response = await fetch(`/api/users/${user.id}/projects?_t=${timestamp}&_nc=${Math.random()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch projects');
      
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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

  // Filter projects based on status
  const openProjects = projects.filter((project: Project) => 
    project.status === 'open' || project.status === 'in_progress'
  );
  
  const closedProjects = projects.filter((project: Project) => 
    project.status === 'completed' || project.status === 'cancelled'
  );

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

  if (projectsLoading || connectionsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="bg-gray-200 h-32 rounded"></div>
            <div className="bg-gray-200 h-32 rounded"></div>
            <div className="bg-gray-200 h-32 rounded"></div>
            <div className="bg-gray-200 h-32 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <FolderOpen className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return "text-blue-600 bg-blue-50";
      case 'in_progress':
        return "text-orange-600 bg-orange-50";
      case 'completed':
        return "text-green-600 bg-green-50";
      case 'cancelled':
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return "bg-blue-100 text-blue-800";
      case 'in_progress':
        return "bg-orange-100 text-orange-800";
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'cancelled':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalBids = projects.reduce((sum: number, project: UserProject) => sum + project.bidCount, 0);
  const pendingBids = projects.reduce((sum: number, project: UserProject) => 
    sum + project.bids.filter((bid: ProjectBid) => bid.status === 'pending').length, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}</p>
        </div>
        <Link href="/post-project">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Post New Project
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="contractors">Contractors</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    <div className="text-2xl font-bold">{projects.length}</div>
                  </div>
                  <Home className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium">Open Projects</CardTitle>
                    <div className="text-2xl font-bold">{openProjects.length}</div>
                  </div>
                  <FolderOpen className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                    <div className="text-2xl font-bold">{projects.filter((p: Project) => p.status === 'completed').length}</div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium">Connected Contractors</CardTitle>
                    <div className="text-2xl font-bold">{connections.length}</div>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-600 mb-4">Start by posting your first project</p>
                  <Link href="/post-project">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Post Project
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project: any) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-medium">{project.title}</h4>
                        <p className="text-sm text-gray-600">{project.category}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {project.address}
                          </span>
                          <span className="text-sm text-gray-500">
                            <DollarSign className="w-3 h-3 inline mr-1" />
                            {project.budget}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getProjectStatusColor(project.status)}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                        </Badge>
                        <span className="text-sm text-gray-500">{project.bidCount || 0} bids</span>
                        <Link href={`/project/${project.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">My Projects</h2>
            <Link href="/post-project">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Post New Project
              </Button>
            </Link>
          </div>

          {/* Project Tabs */}
          <Tabs value={projectTab} onValueChange={setProjectTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="open" className="flex items-center">
                <FolderOpen className="w-4 h-4 mr-2" />
                Open Projects ({openProjects.length})
              </TabsTrigger>
              <TabsTrigger value="closed" className="flex items-center">
                <FolderClosed className="w-4 h-4 mr-2" />
                Closed Projects ({closedProjects.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="space-y-4">
              {openProjects.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No open projects</h3>
                    <p className="text-gray-600 mb-4">Create your first project to get started</p>
                    <Link href="/post-project">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Post Project
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                     {openProjects.map((project: any) => (
                    <Card key={project.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <Badge className={getProjectStatusColor(project.status)}>
                            {getStatusIcon(project.status)}
                            <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                          </Badge>
                          <span className="text-sm text-gray-500">{project.bidCount || 0} bids</span>
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {project.address}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {project.budget}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {project.timeline}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Link href={`/project/${project.id}`} className="flex-1">
                            <Button variant="outline" className="w-full">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateProjectStatus.mutate({ projectId: project.id, status: 'completed' })}
                          >
                            Close
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="closed" className="space-y-4">
              {closedProjects.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FolderClosed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No closed projects</h3>
                    <p className="text-gray-600">Your completed and cancelled projects will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                     {closedProjects.map((project: any) => (
                    <Card key={project.id} className="hover:shadow-lg transition-shadow opacity-90">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <Badge className={getProjectStatusColor(project.status)}>
                            {getStatusIcon(project.status)}
                            <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                          </Badge>
                          <span className="text-sm text-gray-500">{project.bidCount || 0} bids</span>
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {project.address}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {project.budget}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {project.timeline}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Link href={`/project/${project.id}`} className="flex-1">
                            <Button variant="outline" className="w-full">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                          {project.status !== 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateProjectStatus.mutate({ projectId: project.id, status: 'open' })}
                            >
                              Reopen
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

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

        <TabsContent value="messages" className="space-y-6">
          {/* Messages content */}
        </TabsContent>

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
                                         <span className="font-medium">{projects.filter((p: any) => p.status === 'completed').length}</span>
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