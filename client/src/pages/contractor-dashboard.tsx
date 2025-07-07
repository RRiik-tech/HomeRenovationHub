import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Award, 
  Users, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Edit,
  Plus,
  FileText,
  CreditCard,
  Settings,
  Shield,
  Camera,
  Phone,
  Mail,
  Home,
  Calendar,
  BarChart3,
  Wallet,
  Image as ImageIcon,
  Upload,
  Trash2,
  Save,
  MessageSquare
} from "lucide-react";
import { Link } from "wouter";

interface ContractorProfile {
  id: number;
  userId: number;
  companyName: string;
  licenseNumber: string;
  insuranceNumber: string;
  specialties: string[];
  experienceYears: number;
  description: string;
  portfolio: string[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  totalEarnings: number;
  completedProjects: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    photoURL?: string;
  };
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
  project: {
    id: number;
    title: string;
    description: string;
    category: string;
    budget: string;
    timeline: string;
    address: string;
    status: string;
    photos: string[];
    homeowner: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface CompletedProject {
  id: number;
  title: string;
  description: string;
  category: string;
  completedDate: string;
  amount: number;
  rating: number;
  review?: string;
  photos: string[];
  homeowner: {
    firstName: string;
    lastName: string;
  };
}

export default function ContractorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<Partial<ContractorProfile>>({});

  // Fetch contractor profile
  const { data: contractor, isLoading: contractorLoading } = useQuery({
    queryKey: ['contractor-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // First check if user has a contractor profile
      const response = await fetch(`/api/contractors?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch contractor profile');
      
      const contractors = await response.json();
      return contractors.find((c: ContractorProfile) => c.userId === user.id) || null;
    },
    enabled: !!user?.id,
  });

  // Fetch contractor bids
  const { data: bids = [], isLoading: bidsLoading } = useQuery({
    queryKey: ['contractor-bids', contractor?.id],
    queryFn: async () => {
      if (!contractor?.id) return [];
      
      const response = await fetch(`/api/contractors/${contractor.id}/bids`);
      if (!response.ok) throw new Error('Failed to fetch bids');
      
      return response.json();
    },
    enabled: !!contractor?.id,
  });

  // Fetch completed projects
  const { data: completedProjects = [], isLoading: completedLoading } = useQuery({
    queryKey: ['contractor-completed', contractor?.id],
    queryFn: async () => {
      if (!contractor?.id) return [];
      
      const response = await fetch(`/api/contractors/${contractor.id}/completed-projects`);
      if (!response.ok) throw new Error('Failed to fetch completed projects');
      
      return response.json();
    },
    enabled: !!contractor?.id,
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (updatedData: Partial<ContractorProfile>) => {
      const response = await fetch(`/api/contractors/${contractor?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-profile'] });
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

  // Update bid status
  const updateBidStatus = useMutation({
    mutationFn: async ({ bidId, status }: { bidId: number; status: string }) => {
      const response = await fetch(`/api/bids/${bidId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) throw new Error('Failed to update bid status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-bids'] });
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

  useEffect(() => {
    if (contractor) {
      setProfileData(contractor);
    }
  }, [contractor]);

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

  if (contractorLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Complete Your Contractor Profile</h1>
          <p className="text-gray-600 mb-6">
            You need to set up your contractor profile to access the dashboard and start bidding on projects.
          </p>
          <Button asChild size="lg">
            <Link href="/contractor-profile">Set Up Profile</Link>
          </Button>
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
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const pendingBids = bids.filter((bid: ProjectBid) => bid.status === 'pending');
  const acceptedBids = bids.filter((bid: ProjectBid) => bid.status === 'accepted');
  const totalEarnings = contractor?.totalEarnings || completedProjects.reduce((sum: number, project: CompletedProject) => sum + project.amount, 0);
  const averageRating = contractor?.rating || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={contractor.user.photoURL} />
            <AvatarFallback>
              {contractor.user.firstName[0]}{contractor.user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{contractor.companyName}</h1>
            <p className="text-gray-600">{contractor.user.firstName} {contractor.user.lastName}</p>
            <div className="flex items-center mt-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 text-sm font-medium">{averageRating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm ml-1">({contractor.reviewCount} reviews)</span>
              {contractor.isVerified && (
                <Badge variant="secondary" className="ml-2">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
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
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects.length}</div>
            <p className="text-xs text-muted-foreground">+3 this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBids.length}</div>
            <p className="text-xs text-muted-foreground">{acceptedBids.length} accepted</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bids.length > 0 ? Math.round((acceptedBids.length / bids.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Bid acceptance rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Completed Projects</TabsTrigger>
          <TabsTrigger value="bids">New Projects</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bids */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Recent Bids
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bids.slice(0, 3).map((bid: ProjectBid) => (
                    <div key={bid.id} className="flex justify-between items-start p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{bid.project.title}</h4>
                        <p className="text-sm text-gray-600">{bid.project.category}</p>
                        <p className="text-sm font-medium text-green-600">${bid.amount.toLocaleString()}</p>
                      </div>
                      <Badge className={getStatusColor(bid.status)}>
                        {getStatusIcon(bid.status)}
                        <span className="ml-1 capitalize">{bid.status}</span>
                      </Badge>
                    </div>
                  ))}
                  {bids.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No bids yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Completed Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Recent Completions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedProjects.slice(0, 3).map((project: CompletedProject) => (
                    <div key={project.id} className="flex justify-between items-start p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{project.title}</h4>
                        <p className="text-sm text-gray-600">{project.category}</p>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm">{project.rating}/5</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-green-600">${project.amount.toLocaleString()}</p>
                    </div>
                  ))}
                  {completedProjects.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No completed projects yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Monthly Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Chart will be implemented with real data</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Completed Projects</h2>
            <Badge variant="outline">{completedProjects.length} Total</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedProjects.map((project: CompletedProject) => (
              <Card key={project.id} className="overflow-hidden">
                {project.photos.length > 0 && (
                  <div className="aspect-video relative">
                    <img 
                      src={project.photos[0]} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{project.description}</p>
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="secondary">{project.category}</Badge>
                    <span className="text-sm font-medium text-green-600">${project.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 text-sm">{project.rating}/5</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(project.completedDate).toLocaleDateString()}
                    </p>
                  </div>
                  {project.review && (
                    <p className="text-xs text-gray-600 mt-2 italic">"{project.review}"</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {completedProjects.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No completed projects yet</h3>
                <p className="text-gray-600 mb-4">Start bidding on projects to build your portfolio</p>
                <Button asChild>
                  <Link href="/find-contractors">Browse Projects</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* New Projects/Bids Tab */}
        <TabsContent value="bids" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Project Bids</h2>
            <Button asChild>
              <Link href="/find-contractors">
                <Plus className="h-4 w-4 mr-2" />
                Find New Projects
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {bids.map((bid: ProjectBid) => (
              <Card key={bid.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{bid.project.title}</h3>
                      <p className="text-gray-600 mb-2">{bid.project.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {bid.project.address}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {bid.timeline}
                        </span>
                        <Badge variant="outline">{bid.project.category}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(bid.status)}>
                        {getStatusIcon(bid.status)}
                        <span className="ml-1 capitalize">{bid.status}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Your Bid</p>
                        <p className="text-lg font-semibold text-green-600">${bid.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Client Budget</p>
                        <p className="font-medium">{bid.project.budget}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Submitted</p>
                        <p className="font-medium">{new Date(bid.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Your Proposal</p>
                      <p className="text-sm">{bid.proposal}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <Button variant="outline" asChild>
                        <Link href={`/project/${bid.project.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Project
                        </Link>
                      </Button>
                      
                      {bid.status === 'accepted' && (
                        <Button asChild>
                          <Link href={`/messaging/${bid.project.id}`}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message Client
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {bids.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No bids submitted yet</h3>
                <p className="text-gray-600 mb-4">Start bidding on projects to grow your business</p>
                <Button asChild>
                  <Link href="/find-contractors">Browse Available Projects</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Portfolio Showcase</h2>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Add Photos
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {contractor.portfolio.map((photo: string, index: number) => (
              <div key={index} className="relative group">
                <img 
                  src={photo} 
                  alt={`Portfolio ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Add Photo Placeholder */}
            <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
              <div className="text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Add Photo</p>
              </div>
            </div>
          </div>
          
          {contractor.portfolio.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Build your portfolio</h3>
                <p className="text-gray-600 mb-4">Showcase your best work to attract more clients</p>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photos
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <h2 className="text-2xl font-bold">Account Settings</h2>
          
          {editingProfile ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={profileData.companyName || ''}
                      onChange={(e) => setProfileData({...profileData, companyName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="experienceYears">Years of Experience</Label>
                    <Input
                      id="experienceYears"
                      type="number"
                      value={profileData.experienceYears || ''}
                      onChange={(e) => setProfileData({...profileData, experienceYears: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    value={profileData.description || ''}
                    onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={profileData.licenseNumber || ''}
                      onChange={(e) => setProfileData({...profileData, licenseNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="insuranceNumber">Insurance Number</Label>
                    <Input
                      id="insuranceNumber"
                      value={profileData.insuranceNumber || ''}
                      onChange={(e) => setProfileData({...profileData, insuranceNumber: e.target.value})}
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
              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Company:</span>
                    <span>{contractor.companyName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Experience:</span>
                    <span>{contractor.experienceYears} years</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">License:</span>
                    <span>{contractor.licenseNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Insurance:</span>
                    <span>{contractor.insuranceNumber}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Email:</span>
                    <span>{contractor.user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Phone:</span>
                    <span>{contractor.user.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Address:</span>
                    <span>{contractor.user.address}, {contractor.user.city}, {contractor.user.state}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle>Specialties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {contractor.specialties.map((specialty: string, index: number) => (
                  <Badge key={index} variant="secondary">{specialty}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-6">
          <h2 className="text-2xl font-bold">Verification Status</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Account Verification
                {contractor.isVerified && (
                  <Badge variant="secondary" className="ml-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contractor.isVerified ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Account Verified</h3>
                  <p className="text-gray-600">
                    Your contractor account has been verified. You have access to all features.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center py-4">
                    <AlertCircle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Verification Pending</h3>
                    <p className="text-gray-600 mb-4">
                      Complete the verification process to gain full access to our platform.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">License Verification</p>
                          <p className="text-sm text-gray-600">Upload your contractor license</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Upload</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Insurance Verification</p>
                          <p className="text-sm text-gray-600">Upload your insurance certificate</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Upload</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Identity Verification</p>
                          <p className="text-sm text-gray-600">Verify your identity with a government ID</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Upload</Button>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Benefits of Verification</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Higher visibility in search results</li>
                      <li>• Access to premium projects</li>
                      <li>• Increased client trust</li>
                      <li>• Priority customer support</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 