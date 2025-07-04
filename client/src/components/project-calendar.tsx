import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Flag,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Bell,
  MapPin,
  Timer,
  Activity
} from "lucide-react";
import { z } from "zod";
import { format, addDays, isBefore, isAfter, isToday, parseISO } from "date-fns";

const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0, "Amount must be positive"),
  dueDate: z.string(),
  order: z.number().min(1),
});

type MilestoneFormData = z.infer<typeof milestoneSchema>;

interface Milestone {
  id: number;
  projectId: number;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'milestone' | 'deadline' | 'meeting' | 'inspection';
  status: 'pending' | 'completed' | 'overdue';
  description?: string;
  amount?: number;
}

interface ProjectCalendarProps {
  projectId: number;
  canEdit?: boolean;
}

export function ProjectCalendar({ projectId, canEdit = false }: ProjectCalendarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [activeTab, setActiveTab] = useState("calendar");

  const form = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      dueDate: format(new Date(), "yyyy-MM-dd"),
      order: 1,
    },
  });

  // Fetch milestones
  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/milestones`);
      if (!response.ok) throw new Error('Failed to fetch milestones');
      return response.json();
    },
  });

  // Fetch project details
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      return response.json();
    },
  });

  // Create milestone mutation
  const createMilestoneMutation = useMutation({
    mutationFn: async (data: MilestoneFormData) => {
      const response = await fetch('/api/milestones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          projectId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create milestone');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Milestone Created",
        description: "Milestone has been added to the project timeline.",
      });
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
      setShowMilestoneForm(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update milestone status mutation
  const updateMilestoneStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Milestone['status'] }) => {
      const response = await fetch(`/api/milestones/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update milestone');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Milestone Updated",
        description: "Milestone status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Convert milestones to calendar events
  const calendarEvents: CalendarEvent[] = milestones.map((milestone: Milestone) => ({
    id: `milestone-${milestone.id}`,
    title: milestone.title,
    date: parseISO(milestone.dueDate),
    type: 'milestone',
    status: milestone.status,
    description: milestone.description,
    amount: milestone.amount,
  }));

  // Add project deadline if available
  if (project?.timeline) {
    const timelineMap: { [key: string]: number } = {
      'Within 1 month': 30,
      '1-3 months': 90,
      '3-6 months': 180,
      '6+ months': 365,
    };
    
    const days = timelineMap[project.timeline] || 90;
    const deadline = addDays(parseISO(project.createdAt), days);
    
    calendarEvents.push({
      id: 'project-deadline',
      title: 'Project Deadline',
      date: deadline,
      type: 'deadline',
      status: isBefore(deadline, new Date()) ? 'overdue' : 'pending',
      description: `Project completion deadline based on ${project.timeline} timeline`,
    });
  }

  const onSubmit = (data: MilestoneFormData) => {
    createMilestoneMutation.mutate(data);
  };

  const handleStatusUpdate = (milestone: Milestone, newStatus: Milestone['status']) => {
    updateMilestoneStatusMutation.mutate({
      id: milestone.id,
      status: newStatus,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventColor = (type: string, status: string) => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'overdue') return 'bg-red-500';
    
    switch (type) {
      case 'milestone':
        return 'bg-blue-500';
      case 'deadline':
        return 'bg-orange-500';
      case 'meeting':
        return 'bg-purple-500';
      case 'inspection':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Calculate project progress
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((m: Milestone) => m.status === 'completed').length;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const totalBudget = milestones.reduce((sum: number, m: Milestone) => sum + m.amount, 0);
  const completedBudget = milestones
    .filter((m: Milestone) => m.status === 'completed')
    .reduce((sum: number, m: Milestone) => sum + m.amount, 0);

  const overdueMilestones = milestones.filter((m: Milestone) => 
    m.status !== 'completed' && isBefore(parseISO(m.dueDate), new Date())
  ).length;

  const upcomingMilestones = milestones.filter((m: Milestone) => 
    m.status !== 'completed' && 
    isAfter(parseISO(m.dueDate), new Date()) &&
    isBefore(parseISO(m.dueDate), addDays(new Date(), 7))
  ).length;

  return (
    <div className="space-y-6">
      {/* Project Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{progressPercentage.toFixed(0)}%</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">${completedBudget.toLocaleString()}</div>
                <div className="text-sm text-gray-600">of ${totalBudget.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{overdueMilestones}</div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{upcomingMilestones}</div>
                <div className="text-sm text-gray-600">Due This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Project Timeline
            </CardTitle>
            {canEdit && (
              <Dialog open={showMilestoneForm} onOpenChange={setShowMilestoneForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Milestone</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Milestone Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Foundation Complete" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe what needs to be completed..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Amount</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Due Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="order"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex space-x-2">
                        <Button
                          type="submit"
                          disabled={createMilestoneMutation.isPending}
                          className="flex-1"
                        >
                          {createMilestoneMutation.isPending ? "Creating..." : "Create Milestone"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowMilestoneForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    components={{
                      DayContent: ({ date }) => {
                        const dayEvents = calendarEvents.filter(event => 
                          format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                        );
                        
                        return (
                          <div className="relative w-full h-full">
                            <div>{format(date, 'd')}</div>
                            {dayEvents.length > 0 && (
                              <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                                <div className="flex space-x-1">
                                  {dayEvents.slice(0, 3).map((event, index) => (
                                    <div
                                      key={index}
                                      className={`w-2 h-2 rounded-full ${getEventColor(event.type, event.status)}`}
                                    />
                                  ))}
                                  {dayEvents.length > 3 && (
                                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      },
                    }}
                  />
                </div>

                {/* Selected Date Events */}
                <div>
                  <h3 className="font-semibold mb-3">
                    {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                  </h3>
                  {selectedDate && (
                    <div className="space-y-2">
                      {calendarEvents
                        .filter(event => 
                          format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                        )
                        .map((event) => (
                          <div
                            key={event.id}
                            className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${getEventColor(event.type, event.status)}`} />
                                <span className="font-medium">{event.title}</span>
                              </div>
                              <Badge variant="outline" className={getStatusColor(event.status)}>
                                {event.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            {event.description && (
                              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            )}
                            {event.amount && (
                              <p className="text-sm font-medium text-green-600 mt-1">
                                ${event.amount.toLocaleString()}
                              </p>
                            )}
                          </div>
                        ))}
                      {calendarEvents.filter(event => 
                        format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                      ).length === 0 && (
                        <p className="text-gray-500 text-sm">No events scheduled for this date.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Project Timeline</h3>
                  <div className="flex items-center space-x-2">
                    <Progress value={progressPercentage} className="w-32" />
                    <span className="text-sm text-gray-600">{progressPercentage.toFixed(0)}%</span>
                  </div>
                </div>
                
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                  
                  {/* Timeline Events */}
                  <div className="space-y-6">
                    {calendarEvents
                      .sort((a, b) => a.date.getTime() - b.date.getTime())
                      .map((event, index) => (
                        <div key={event.id} className="relative flex items-start space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventColor(event.type, event.status)} text-white z-10`}>
                            {event.type === 'milestone' && <Flag className="h-4 w-4" />}
                            {event.type === 'deadline' && <Clock className="h-4 w-4" />}
                            {event.type === 'meeting' && <Users className="h-4 w-4" />}
                            {event.type === 'inspection' && <CheckCircle className="h-4 w-4" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{event.title}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className={getStatusColor(event.status)}>
                                  {event.status.replace('_', ' ')}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {format(event.date, 'MMM d')}
                                </span>
                              </div>
                            </div>
                            {event.description && (
                              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            )}
                            {event.amount && (
                              <p className="text-sm font-medium text-green-600 mt-1">
                                ${event.amount.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="milestones" className="space-y-4">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">Loading milestones...</div>
                ) : milestones.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No milestones created yet. Add your first milestone to get started!
                  </div>
                ) : (
                  milestones.map((milestone: Milestone) => (
                    <Card key={milestone.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{milestone.title}</h4>
                              <Badge variant="outline" className={getStatusColor(milestone.status)}>
                                {milestone.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1">
                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  {format(parseISO(milestone.dueDate), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  ${milestone.amount.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {canEdit && (
                            <div className="flex space-x-2">
                              <Select
                                value={milestone.status}
                                onValueChange={(value) => handleStatusUpdate(milestone, value as Milestone['status'])}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 