import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  DollarSign,
  Users,
  Building,
  Calendar,
  Target,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  MapPin,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart as RechartsBarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Cell, 
  Pie,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval } from "date-fns";

interface AnalyticsData {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalRevenue: number;
    averageProjectValue: number;
    customerSatisfaction: number;
    growthRate: number;
    conversionRate: number;
  };
  trends: {
    projectsOverTime: Array<{ date: string; projects: number; revenue: number }>;
    categoryDistribution: Array<{ category: string; count: number; value: number }>;
    monthlyGrowth: Array<{ month: string; growth: number }>;
    satisfactionTrend: Array<{ date: string; satisfaction: number }>;
  };
  performance: {
    topContractors: Array<{ name: string; projects: number; rating: number; revenue: number }>;
    projectCategories: Array<{ category: string; avgDuration: number; avgValue: number; successRate: number }>;
    geographicData: Array<{ location: string; projects: number; revenue: number }>;
    timeMetrics: {
      avgProjectDuration: number;
      avgResponseTime: number;
      onTimeCompletion: number;
    };
  };
}

interface AnalyticsDashboardProps {
  userType?: 'homeowner' | 'contractor' | 'admin';
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

// Helper functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const getGrowthColor = (growth: number) => {
  if (growth > 0) return 'text-green-600';
  if (growth < 0) return 'text-red-600';
  return 'text-gray-600';
};

const getGrowthIcon = (growth: number) => {
  if (growth > 0) return <TrendingUp className="h-4 w-4" />;
  if (growth < 0) return <TrendingDown className="h-4 w-4" />;
  return <Activity className="h-4 w-4" />;
};

// Homeowner Dashboard Component
function HomeownerAnalyticsDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['homeowner-analytics', selectedTimeRange],
    queryFn: async () => {
      return generateHomeownerData();
    },
  });

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Analytics</h1>
          <p className="text-gray-600">Track your renovation projects and spending</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedTimeRange} onValueChange={(value: string) => setSelectedTimeRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Homeowner Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Posted Projects</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalProjects}</p>
                <div className="flex items-center space-x-1 text-sm text-blue-600">
                  <Building className="h-4 w-4" />
                  <span>{analytics.activeProjects} active</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(analytics.totalSpent)}</p>
                <div className="flex items-center space-x-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Budget managed</span>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Project Value</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(analytics.avgProjectValue)}</p>
                <div className="flex items-center space-x-1 text-sm text-purple-600">
                  <Target className="h-4 w-4" />
                  <span>Per project</span>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contractor Rating</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.avgContractorRating.toFixed(1)}</p>
                <div className="flex items-center space-x-1 text-sm text-yellow-600">
                  <Star className="h-4 w-4" />
                  <span>Average rating</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Planning</span>
                <span className="text-sm text-gray-600">{analytics.planningProjects} projects</span>
              </div>
              <Progress value={(analytics.planningProjects / analytics.totalProjects) * 100} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In Progress</span>
                <span className="text-sm text-gray-600">{analytics.activeProjects} projects</span>
              </div>
              <Progress value={(analytics.activeProjects / analytics.totalProjects) * 100} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed</span>
                <span className="text-sm text-gray-600">{analytics.completedProjects} projects</span>
              </div>
              <Progress value={(analytics.completedProjects / analytics.totalProjects) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.categorySpending.map((category: any, index: number) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index] }} />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <span className="text-sm font-bold">{formatCurrency(category.amount)}</span>
                </div>
              ))}
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
          <div className="space-y-4">
            {analytics.recentProjects.map((project: any) => (
              <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{project.title}</h4>
                  <p className="text-sm text-gray-600">{project.category} • {project.location}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(project.budget)}</div>
                  <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Contractor Dashboard Component  
function ContractorAnalyticsDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['contractor-analytics', selectedTimeRange],
    queryFn: async () => {
      return generateContractorData();
    },
  });

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
          <p className="text-gray-600">Track your contracting business performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedTimeRange} onValueChange={(value: string) => setSelectedTimeRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Contractor Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalProjects}</p>
                <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(analytics.growthRate)}`}>
                  {getGrowthIcon(analytics.growthRate)}
                  <span>{formatPercentage(Math.abs(analytics.growthRate))} vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
                <div className="flex items-center space-x-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>+12% this month</span>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Rating</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.customerRating.toFixed(1)}</p>
                <div className="flex items-center space-x-1 text-sm text-yellow-600">
                  <Star className="h-4 w-4" />
                  <span>Average rating</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Win Rate</p>
                <p className="text-3xl font-bold text-gray-900">{formatPercentage(analytics.winRate)}</p>
                <div className="flex items-center space-x-1 text-sm text-purple-600">
                  <Target className="h-4 w-4" />
                  <span>Project bids</span>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={analytics.revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.projectCategories.map((category: any, index: number) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index] }} />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{category.count} projects</div>
                    <div className="text-sm text-gray-600">{formatCurrency(category.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.activeProjects.map((project: any) => (
              <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{project.title}</h4>
                  <p className="text-sm text-gray-600">{project.client} • {project.location}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(project.value)}</div>
                  <Badge variant={project.status === 'in_progress' ? 'default' : 'secondary'}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AnalyticsDashboard({ userType = 'admin' }: AnalyticsDashboardProps) {
  // Render different dashboards based on user type
  if (userType === 'homeowner') {
    return <HomeownerAnalyticsDashboard />;
  }

  if (userType === 'contractor') {
    return <ContractorAnalyticsDashboard />;
  }

  // Default admin dashboard (original)
  return <ContractorAnalyticsDashboard />;
}

// Mock data generators
function generateHomeownerData() {
  return {
    totalProjects: 8,
    activeProjects: 2,
    completedProjects: 5,
    planningProjects: 1,
    totalSpent: 125000,
    avgProjectValue: 15625,
    avgContractorRating: 4.7,
    categorySpending: [
      { name: 'Kitchen Renovation', amount: 45000 },
      { name: 'Bathroom Remodel', amount: 32000 },
      { name: 'Flooring', amount: 28000 },
      { name: 'Painting', amount: 20000 }
    ],
    recentProjects: [
      { id: 1, title: 'Kitchen Renovation', category: 'Kitchen', location: 'San Francisco, CA', budget: 45000, status: 'completed' },
      { id: 2, title: 'Master Bathroom Remodel', category: 'Bathroom', location: 'San Francisco, CA', budget: 32000, status: 'in_progress' },
      { id: 3, title: 'Hardwood Flooring', category: 'Flooring', location: 'San Francisco, CA', budget: 28000, status: 'planning' }
    ]
  };
}

function generateContractorData() {
  return {
    totalProjects: 47,
    completedProjects: 39,
    totalRevenue: 485000,
    customerRating: 4.8,
    winRate: 73,
    growthRate: 15.3,
    revenueData: [
      { month: 'Jan', revenue: 35000 },
      { month: 'Feb', revenue: 42000 },
      { month: 'Mar', revenue: 38000 },
      { month: 'Apr', revenue: 51000 },
      { month: 'May', revenue: 49000 },
      { month: 'Jun', revenue: 55000 }
    ],
    projectCategories: [
      { name: 'Kitchen Renovation', count: 15, revenue: 180000 },
      { name: 'Bathroom Remodel', count: 12, revenue: 145000 },
      { name: 'Flooring', count: 10, revenue: 85000 },
      { name: 'Painting', count: 10, revenue: 75000 }
    ],
    activeProjects: [
      { id: 1, title: 'Luxury Kitchen Remodel', client: 'Smith Family', location: 'Palo Alto, CA', value: 65000, status: 'in_progress' },
      { id: 2, title: 'Master Suite Addition', client: 'Johnson Family', location: 'San Jose, CA', value: 85000, status: 'planning' },
      { id: 3, title: 'Bathroom Renovation', client: 'Brown Family', location: 'Oakland, CA', value: 35000, status: 'in_progress' }
    ]
  };
} 