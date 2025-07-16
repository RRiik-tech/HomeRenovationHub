import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Bell,
  BellRing,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  DollarSign,
  FileText,
  Calendar,
  Settings,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Trash2,
  Filter,
  Clock,
  User,
  Star,
  TrendingUp,
  Archive,
  Zap
} from "lucide-react";
import { format, parseISO, isToday, isYesterday, formatDistanceToNow } from "date-fns";

interface Notification {
  id: number;
  userId: number;
  type: 'bid_received' | 'bid_accepted' | 'bid_rejected' | 'project_update' | 'message_received' | 'review_received' | 'payment_received';
  title: string;
  message: string;
  relatedId?: number;
  relatedType?: 'project' | 'bid' | 'message' | 'review' | 'payment';
  isRead: boolean;
  createdAt: string;
}

interface NotificationPreferences {
  emailNotifications: {
    bidReceived: boolean;
    bidAccepted: boolean;
    bidRejected: boolean;
    projectUpdates: boolean;
    messages: boolean;
    reviews: boolean;
    payments: boolean;
  };
  pushNotifications: {
    bidReceived: boolean;
    bidAccepted: boolean;
    bidRejected: boolean;
    projectUpdates: boolean;
    messages: boolean;
    reviews: boolean;
    payments: boolean;
  };
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface NotificationCenterProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function NotificationCenter({ isOpen = false, onClose }: NotificationCenterProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/users/${user.id}/notifications`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const response = await fetch(`/api/users/${user.id}/notifications/unread-count`);
      if (!response.ok) throw new Error('Failed to fetch unread count');
      const data = await response.json();
      return data.count;
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', user?.id] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter((n: Notification) => !n.isRead);
      await Promise.all(
        unreadNotifications.map((n: Notification) => 
          fetch(`/api/notifications/${n.id}/read`, { method: 'PUT' })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', user?.id] });
      toast({
        title: "All notifications marked as read",
        description: "Your notification list has been cleared.",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid_received':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'bid_accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'bid_rejected':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'project_update':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'message_received':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case 'review_received':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'payment_received':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'bid_received':
      case 'bid_accepted':
      case 'payment_received':
        return 'bg-green-50 border-green-200';
      case 'bid_rejected':
        return 'bg-red-50 border-red-200';
      case 'project_update':
        return 'bg-blue-50 border-blue-200';
      case 'message_received':
        return 'bg-purple-50 border-purple-200';
      case 'review_received':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatNotificationTime = (dateString: string) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate to related content
    if (notification.relatedType && notification.relatedId) {
      switch (notification.relatedType) {
        case 'project':
                        window.location.href = `/project/${notification.relatedId}`;
          break;
        case 'bid':
          // Navigate to bid management
          break;
        case 'message':
          window.location.href = `/messaging/${notification.relatedId}`;
          break;
        default:
          break;
      }
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    
    if (activeTab === 'all') return true;
    return notification.type === activeTab;
  });

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups: any, notification: Notification) => {
    const date = parseISO(notification.createdAt);
    let groupKey;
    
    if (isToday(date)) {
      groupKey = 'Today';
    } else if (isYesterday(date)) {
      groupKey = 'Yesterday';
    } else {
      groupKey = format(date, 'MMMM d, yyyy');
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
    
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      {/* Notification Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Notification Settings</DialogTitle>
                  </DialogHeader>
                  <NotificationSettings />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center justify-between mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="bid_received">Bids</TabsTrigger>
                <TabsTrigger value="message_received">Messages</TabsTrigger>
                <TabsTrigger value="project_update">Projects</TabsTrigger>
                <TabsTrigger value="payment_received">Payments</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>

          {/* Notifications List */}
          {isLoading ? (
            <div className="text-center py-8">Loading notifications...</div>
          ) : Object.keys(groupedNotifications).length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
              <p className="text-gray-600">
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedNotifications).map(([dateGroup, groupNotifications]: [string, any]) => (
                <div key={dateGroup}>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">{dateGroup}</h3>
                  <div className="space-y-2">
                    {groupNotifications.map((notification: Notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                          !notification.isRead ? getNotificationColor(notification.type) : 'bg-white border-gray-200'
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-2">
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                                <span className="text-xs text-gray-500">
                                  {formatNotificationTime(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                            <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-800' : 'text-gray-600'}`}>
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Notification Settings Component
function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: {
      bidReceived: true,
      bidAccepted: true,
      bidRejected: true,
      projectUpdates: true,
      messages: true,
      reviews: true,
      payments: true,
    },
    pushNotifications: {
      bidReceived: true,
      bidAccepted: true,
      bidRejected: false,
      projectUpdates: true,
      messages: true,
      reviews: false,
      payments: true,
    },
    frequency: 'instant',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });

  const notificationTypes = [
    { key: 'bidReceived', label: 'New Bids Received', icon: DollarSign },
    { key: 'bidAccepted', label: 'Bids Accepted', icon: CheckCircle },
    { key: 'bidRejected', label: 'Bids Rejected', icon: AlertCircle },
    { key: 'projectUpdates', label: 'Project Updates', icon: FileText },
    { key: 'messages', label: 'New Messages', icon: MessageSquare },
    { key: 'reviews', label: 'New Reviews', icon: Star },
    { key: 'payments', label: 'Payment Notifications', icon: DollarSign },
  ];

  const handleEmailToggle = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [key]: value,
      },
    }));
  };

  const handlePushToggle = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      pushNotifications: {
        ...prev.pushNotifications,
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Notification Types */}
      <div>
        <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-700 border-b pb-2">
            <div>Notification Type</div>
            <div className="text-center">Email</div>
            <div className="text-center">Push</div>
          </div>
          {notificationTypes.map((type) => (
            <div key={type.key} className="grid grid-cols-3 gap-4 items-center">
              <div className="flex items-center space-x-2">
                <type.icon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{type.label}</span>
              </div>
              <div className="text-center">
                <Switch
                  checked={preferences.emailNotifications[type.key as keyof typeof preferences.emailNotifications]}
                  onCheckedChange={(checked) => handleEmailToggle(type.key, checked)}
                />
              </div>
              <div className="text-center">
                <Switch
                  checked={preferences.pushNotifications[type.key as keyof typeof preferences.pushNotifications]}
                  onCheckedChange={(checked) => handlePushToggle(type.key, checked)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Frequency Settings */}
      <div>
        <h3 className="text-lg font-medium mb-4">Notification Frequency</h3>
        <div className="space-y-3">
          {[
            { value: 'instant', label: 'Instant', description: 'Receive notifications immediately' },
            { value: 'hourly', label: 'Hourly', description: 'Receive notifications every hour' },
            { value: 'daily', label: 'Daily', description: 'Receive notifications once per day' },
            { value: 'weekly', label: 'Weekly', description: 'Receive notifications once per week' },
          ].map((option) => (
            <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="frequency"
                value={option.value}
                checked={preferences.frequency === option.value}
                onChange={(e) => setPreferences(prev => ({ ...prev, frequency: e.target.value as any }))}
                className="mt-1"
              />
              <div>
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-xs text-gray-600">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div>
        <h3 className="text-lg font-medium mb-4">Quiet Hours</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <Switch
              checked={preferences.quietHours.enabled}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({
                  ...prev,
                  quietHours: { ...prev.quietHours, enabled: checked }
                }))
              }
            />
            <span className="text-sm">Enable quiet hours</span>
          </label>
          
          {preferences.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <input
                  type="time"
                  value={preferences.quietHours.start}
                  onChange={(e) => 
                    setPreferences(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, start: e.target.value }
                    }))
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Time</label>
                <input
                  type="time"
                  value={preferences.quietHours.end}
                  onChange={(e) => 
                    setPreferences(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, end: e.target.value }
                    }))
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save Preferences</Button>
      </div>
    </div>
  );
}

// Notification Bell Component for Navigation
export function NotificationBell() {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const response = await fetch(`/api/users/${user.id}/notifications/unread-count`);
      if (!response.ok) return 0;
      const data = await response.json();
      return data.count;
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  return (
    <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      </DialogContent>
    </Dialog>
  );
} 