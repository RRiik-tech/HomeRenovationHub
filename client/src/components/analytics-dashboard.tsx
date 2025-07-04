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

export function AnalyticsDashboard({ userType = 'admin', timeRange = '30d' }: AnalyticsDashboardProps) {
  const { user } = useAuth();
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', userType, selectedTimeRange, selectedCategory],
    queryFn: async () => {
      // Mock data - in real app, this would be an API call
      return generateMockAnalyticsData(selectedTimeRange, selectedCategory);
    },
  });

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

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

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track performance, trends, and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
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
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="kitchen">Kitchen</SelectItem>
              <SelectItem value="bathroom">Bathroom</SelectItem>
              <SelectItem value="roofing">Roofing</SelectItem>
              <SelectItem value="flooring">Flooring</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview.totalProjects}</p>
                <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(analytics.overview.growthRate)}`}>
                  {getGrowthIcon(analytics.overview.growthRate)}
                  <span>{formatPercentage(Math.abs(analytics.overview.growthRate))} vs last period</span>
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
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(analytics.overview.totalRevenue)}</p>
                <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(15.2)}`}>
                  {getGrowthIcon(15.2)}
                  <span>15.2% vs last period</span>
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
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(analytics.overview.averageProjectValue)}</p>
                <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(8.1)}`}>
                  {getGrowthIcon(8.1)}
                  <span>8.1% vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview.customerSatisfaction}/5.0</p>
                <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(2.3)}`}>
                  {getGrowthIcon(2.3)}
                  <span>2.3% vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Projects Over Time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Projects Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={analytics.trends.projectsOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="projects" stroke="#3B82F6" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Revenue Over Time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analytics.trends.projectsOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Project Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={analytics.trends.categoryDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analytics.trends.categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Key Performance Indicators */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Performance Indicators</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Conversion Rate</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={analytics.overview.conversionRate} className="w-24" />
                        <span className="text-sm text-gray-600">{formatPercentage(analytics.overview.conversionRate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">On-Time Completion</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={analytics.performance.timeMetrics.onTimeCompletion} className="w-24" />
                        <span className="text-sm text-gray-600">{formatPercentage(analytics.performance.timeMetrics.onTimeCompletion)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Customer Satisfaction</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(analytics.overview.customerSatisfaction / 5) * 100} className="w-24" />
                        <span className="text-sm text-gray-600">{analytics.overview.customerSatisfaction}/5.0</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Growth Rate</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={analytics.overview.growthRate > 0 ? "default" : "destructive"}>
                          {formatPercentage(analytics.overview.growthRate)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Growth */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Growth Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={analytics.trends.monthlyGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Bar dataKey="growth" fill="#3B82F6" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Satisfaction Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Satisfaction Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={analytics.trends.satisfactionTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="satisfaction" stroke="#10B981" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Category Performance */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Category Performance Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.performance.projectCategories.map((category, index) => (
                        <div key={category.category} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{category.category}</h4>
                            <Badge variant="outline">{formatPercentage(category.successRate)} success rate</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Avg Duration:</span>
                              <div className="font-medium">{category.avgDuration} days</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Avg Value:</span>
                              <div className="font-medium">{formatCurrency(category.avgValue)}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Success Rate:</span>
                              <div className="font-medium">{formatPercentage(category.successRate)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Contractors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Performing Contractors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.performance.topContractors.map((contractor, index) => (
                        <div key={contractor.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{contractor.name}</div>
                              <div className="text-sm text-gray-600">{contractor.projects} projects</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(contractor.revenue)}</div>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{contractor.rating}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Geographic Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Geographic Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.performance.geographicData.map((location, index) => (
                        <div key={location.location} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{location.location}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(location.revenue)}</div>
                            <div className="text-sm text-gray-600">{location.projects} projects</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Time Metrics */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Time & Efficiency Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 border rounded-lg">
                        <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{analytics.performance.timeMetrics.avgProjectDuration}</div>
                        <div className="text-sm text-gray-600">Avg Project Duration (days)</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{analytics.performance.timeMetrics.avgResponseTime}h</div>
                        <div className="text-sm text-gray-600">Avg Response Time</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{formatPercentage(analytics.performance.timeMetrics.onTimeCompletion)}</div>
                        <div className="text-sm text-gray-600">On-Time Completion</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI-Powered Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-blue-900">Growth Opportunity</div>
                          <div className="text-sm text-blue-700 mt-1">
                            Kitchen renovations show 34% higher profit margins. Consider focusing marketing efforts on this category.
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-yellow-900">Attention Needed</div>
                          <div className="text-sm text-yellow-700 mt-1">
                            Response times have increased by 15% this month. Consider optimizing contractor availability.
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-green-900">Success Pattern</div>
                          <div className="text-sm text-green-700 mt-1">
                            Projects with detailed initial consultations have 89% higher satisfaction rates.
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                          1
                        </div>
                        <div>
                          <div className="font-medium">Expand Kitchen Services</div>
                          <div className="text-sm text-gray-600">High demand and profitability in kitchen renovations</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium text-green-600">
                          2
                        </div>
                        <div>
                          <div className="font-medium">Improve Response Times</div>
                          <div className="text-sm text-gray-600">Faster responses lead to higher conversion rates</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">
                          3
                        </div>
                        <div>
                          <div className="font-medium">Focus on Quality</div>
                          <div className="text-sm text-gray-600">Maintain high standards to improve customer satisfaction</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Forecast */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={generateForecastData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Area type="monotone" dataKey="actual" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="forecast" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.4} strokeDasharray="5 5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to generate mock analytics data
function generateMockAnalyticsData(timeRange: string, category: string): AnalyticsData {
  const now = new Date();
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  
  // Generate time series data
  const projectsOverTime = eachDayOfInterval({
    start: subDays(now, days),
    end: now
  }).map(date => ({
    date: format(date, 'MM/dd'),
    projects: Math.floor(Math.random() * 10) + 5,
    revenue: Math.floor(Math.random() * 50000) + 20000
  }));

  return {
    overview: {
      totalProjects: 247,
      activeProjects: 38,
      completedProjects: 209,
      totalRevenue: 1250000,
      averageProjectValue: 5060,
      customerSatisfaction: 4.6,
      growthRate: 12.5,
      conversionRate: 68.3
    },
    trends: {
      projectsOverTime,
      categoryDistribution: [
        { category: 'Kitchen', count: 89, value: 450000 },
        { category: 'Bathroom', count: 67, value: 320000 },
        { category: 'Roofing', count: 45, value: 280000 },
        { category: 'Flooring', count: 34, value: 150000 },
        { category: 'Other', count: 12, value: 50000 }
      ],
      monthlyGrowth: [
        { month: 'Jan', growth: 8.2 },
        { month: 'Feb', growth: 12.1 },
        { month: 'Mar', growth: 15.3 },
        { month: 'Apr', growth: 9.7 },
        { month: 'May', growth: 18.4 },
        { month: 'Jun', growth: 22.1 }
      ],
      satisfactionTrend: [
        { date: '1/1', satisfaction: 4.2 },
        { date: '1/15', satisfaction: 4.3 },
        { date: '2/1', satisfaction: 4.4 },
        { date: '2/15', satisfaction: 4.5 },
        { date: '3/1', satisfaction: 4.6 },
        { date: '3/15', satisfaction: 4.6 }
      ]
    },
    performance: {
      topContractors: [
        { name: 'Elite Renovations', projects: 23, rating: 4.9, revenue: 125000 },
        { name: 'Premium Builders', projects: 19, rating: 4.8, revenue: 98000 },
        { name: 'Craft Masters', projects: 16, rating: 4.7, revenue: 87000 },
        { name: 'Home Experts', projects: 14, rating: 4.6, revenue: 76000 },
        { name: 'Quality Works', projects: 12, rating: 4.5, revenue: 65000 }
      ],
      projectCategories: [
        { category: 'Kitchen', avgDuration: 28, avgValue: 5056, successRate: 94.2 },
        { category: 'Bathroom', avgDuration: 18, avgValue: 4776, successRate: 91.8 },
        { category: 'Roofing', avgDuration: 12, avgValue: 6222, successRate: 96.7 },
        { category: 'Flooring', avgDuration: 8, avgValue: 4412, successRate: 89.4 }
      ],
      geographicData: [
        { location: 'San Francisco, CA', projects: 45, revenue: 285000 },
        { location: 'Los Angeles, CA', projects: 38, revenue: 195000 },
        { location: 'Seattle, WA', projects: 32, revenue: 165000 },
        { location: 'Portland, OR', projects: 28, revenue: 142000 },
        { location: 'San Diego, CA', projects: 24, revenue: 125000 }
      ],
      timeMetrics: {
        avgProjectDuration: 21,
        avgResponseTime: 2.4,
        onTimeCompletion: 87.3
      }
    }
  };
}

// Helper function to generate forecast data
function generateForecastData() {
  return [
    { month: 'Jan', actual: 85000, forecast: null },
    { month: 'Feb', actual: 92000, forecast: null },
    { month: 'Mar', actual: 78000, forecast: null },
    { month: 'Apr', actual: 105000, forecast: null },
    { month: 'May', actual: 98000, forecast: null },
    { month: 'Jun', actual: 112000, forecast: null },
    { month: 'Jul', actual: null, forecast: 118000 },
    { month: 'Aug', actual: null, forecast: 125000 },
    { month: 'Sep', actual: null, forecast: 132000 },
    { month: 'Oct', actual: null, forecast: 128000 },
    { month: 'Nov', actual: null, forecast: 145000 },
    { month: 'Dec', actual: null, forecast: 155000 }
  ];
} 