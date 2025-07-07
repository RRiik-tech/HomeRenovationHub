import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import { NotificationBell } from "@/components/notification-center";
import { 
  Home,
  Search,
  MessageSquare,
  User,
  Menu,
  Plus,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Wifi,
  WifiOff,
  Download,
  Share,
  Bookmark,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Camera,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  Activity,
  Grid,
  List,
  Filter,
  Zap
} from "lucide-react";
import { Link } from "wouter";

interface MobileAppShellProps {
  children: React.ReactNode;
}

export function MobileAppShell({ children }: MobileAppShellProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const isMobile = useMobile();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // PWA Install Detection
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Online/Offline Detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Scroll Detection for Back-to-Top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Touch Gesture Handling
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = startY - endY;

      // Only handle horizontal swipes that are longer than vertical
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          setSwipeDirection('left');
        } else {
          setSwipeDirection('right');
        }
        
        // Clear swipe direction after animation
        setTimeout(() => setSwipeDirection(null), 300);
      }
    };

    if (isMobile) {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile]);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      
      setDeferredPrompt(null);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const navigationItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/find-contractors', icon: Search, label: 'Search' },
    { path: '/post-project', icon: Plus, label: 'Post', isAction: true },
    { path: '/messaging', icon: MessageSquare, label: 'Messages' },
    { path: user?.userType === 'contractor' ? '/contractor-dashboard' : '/user-dashboard', icon: User, label: 'Profile' },
  ];

  const isActiveRoute = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center space-x-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <MobileSidebar />
              </SheetContent>
            </Sheet>
            
            <div>
              <h1 className="font-bold text-lg">Home Reno Hub</h1>
              {!isOnline && (
                <div className="flex items-center space-x-1 text-xs text-red-600">
                  <WifiOff className="h-3 w-3" />
                  <span>Offline</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2">
            <NotificationBell />
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* PWA Install Banner */}
        {showInstallPrompt && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Download className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Install App</span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => setShowInstallPrompt(false)}>
                  Later
                </Button>
                <Button size="sm" onClick={handleInstallApp}>
                  Install
                </Button>
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Get the full experience with our mobile app
            </p>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={`pb-20 transition-transform duration-300 ${
        swipeDirection === 'left' ? 'transform -translate-x-2' : 
        swipeDirection === 'right' ? 'transform translate-x-2' : ''
      }`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 h-16">
          {navigationItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <button
                className={`flex flex-col items-center justify-center h-full space-y-1 transition-colors ${
                  isActiveRoute(item.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                } ${item.isAction ? 'relative' : ''}`}
              >
                {item.isAction ? (
                  <div className="absolute -top-3 bg-blue-600 text-white rounded-full p-2">
                    <item.icon className="h-5 w-5" />
                  </div>
                ) : (
                  <item.icon className="h-5 w-5" />
                )}
                <span className={`text-xs ${item.isAction ? 'mt-2' : ''}`}>
                  {item.label}
                </span>
              </button>
            </Link>
          ))}
        </div>
      </nav>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-40 rounded-full w-12 h-12 shadow-lg"
          size="sm"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}

      {/* Swipe Indicators */}
      {swipeDirection && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
          <div className="flex items-center space-x-2">
            {swipeDirection === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="text-sm">
              {swipeDirection === 'left' ? 'Swipe left detected' : 'Swipe right detected'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Mobile Sidebar Component
function MobileSidebar() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/find-contractors', icon: Search, label: 'Find Contractors' },
    { path: '/post-project', icon: Plus, label: 'Post Project' },
    { path: '/messaging', icon: MessageSquare, label: 'Messages' },
    { path: '/user-dashboard', icon: User, label: 'Dashboard' },
    { path: '/contractor-marketplace', icon: Star, label: 'Marketplace' },
    { path: '/ai-recommendations', icon: Zap, label: 'AI Recommendations' },
  ];

  const quickActions = [
    { icon: Camera, label: 'Take Photo', action: () => {} },
    { icon: MapPin, label: 'Find Nearby', action: () => {} },
    { icon: Calendar, label: 'Schedule', action: () => {} },
    { icon: Share, label: 'Share App', action: () => {} },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.photoURL} />
            <AvatarFallback>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user?.firstName} {user?.lastName}</div>
            <div className="text-sm text-gray-600">{user?.email}</div>
            <Badge variant="outline" className="text-xs mt-1">
              {user?.userType === 'contractor' ? 'Contractor' : 'Homeowner'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <button
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                  location === item.path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </Link>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="mt-8 px-3">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={action.action}
                className="flex flex-col items-center space-y-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <action.icon className="h-5 w-5 text-gray-600" />
                <span className="text-xs text-gray-600">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 p-4 space-y-3">
        <Link href="/settings">
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

// Mobile-Optimized Card Component
export function MobileCard({ 
  children, 
  className = "",
  swipeable = false,
  onSwipeLeft,
  onSwipeRight
}: {
  children: React.ReactNode;
  className?: string;
  swipeable?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!swipeable) return;

    let startX = 0;
    let currentX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      setIsDragging(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      setSwipeOffset(Math.max(-100, Math.min(100, diff)));
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      
      if (swipeOffset > 50 && onSwipeRight) {
        onSwipeRight();
      } else if (swipeOffset < -50 && onSwipeLeft) {
        onSwipeLeft();
      }
      
      setSwipeOffset(0);
      setIsDragging(false);
    };

    const element = document.getElementById('swipeable-card');
    if (element) {
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchmove', handleTouchMove);
      element.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [swipeable, isDragging, swipeOffset, onSwipeLeft, onSwipeRight]);

  return (
    <Card 
      id={swipeable ? 'swipeable-card' : undefined}
      className={`transition-transform duration-200 ${className}`}
      style={swipeable ? { transform: `translateX(${swipeOffset}px)` } : undefined}
    >
      {children}
    </Card>
  );
}

// Mobile-Optimized List Component
export function MobileList({ 
  items, 
  renderItem, 
  onLoadMore,
  hasMore = false,
  loading = false
}: {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}) {
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        onLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onLoadMore, hasMore]);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.id || index}>
          {renderItem(item, index)}
        </div>
      ))}
      
      {loading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading more...</span>
          </div>
        </div>
      )}
      
      {hasMore && !loading && (
        <div className="text-center py-4">
          <Button variant="outline" onClick={onLoadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

// Mobile-Optimized Bottom Sheet
export function MobileBottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
} 