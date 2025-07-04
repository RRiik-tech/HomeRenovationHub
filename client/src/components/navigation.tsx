import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, X, Home, Search, PlusCircle, MessageSquare, User, Briefcase, LogOut, BarChart3, Star, CreditCard, FileText, Calendar, Bell, Store } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import AuthModal from "@/components/auth-modal";

export default function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Initialize Google Auth (safely within component context)
  useGoogleAuth();

  const isActive = (path: string) => location === path;

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HomeConnect Pro</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/find-contractors">
              <span className={`text-sm font-medium cursor-pointer transition-colors ${
                isActive("/find-contractors") 
                  ? "text-primary border-b-2 border-primary pb-1" 
                  : "text-gray-700 hover:text-primary"
              }`}>
                Find Contractors
              </span>
            </Link>
            <Link href="/post-project">
              <span className={`text-sm font-medium cursor-pointer transition-colors ${
                isActive("/post-project") 
                  ? "text-primary border-b-2 border-primary pb-1" 
                  : "text-gray-700 hover:text-primary"
              }`}>
                Post Project
              </span>
            </Link>
            <Link href="/messaging">
              <span className={`text-sm font-medium cursor-pointer transition-colors ${
                isActive("/messaging") 
                  ? "text-primary border-b-2 border-primary pb-1" 
                  : "text-gray-700 hover:text-primary"
              }`}>
                Messages
              </span>
            </Link>
            <Link href="/marketplace">
              <span className={`text-sm font-medium cursor-pointer transition-colors ${
                isActive("/marketplace") 
                  ? "text-primary border-b-2 border-primary pb-1" 
                  : "text-gray-700 hover:text-primary"
              }`}>
                Marketplace
              </span>
            </Link>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || undefined} alt={user.firstName} />
                      <AvatarFallback className="bg-primary text-white">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.userType}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {user.userType === "contractor" && (
                    <DropdownMenuItem asChild>
                      <Link href="/contractor-dashboard" className="w-full cursor-pointer">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.userType === "homeowner" && (
                    <DropdownMenuItem asChild>
                      <Link href="/user-dashboard" className="w-full cursor-pointer">
                        <Home className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/messaging" className="w-full cursor-pointer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/notifications" className="w-full cursor-pointer">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/analytics" className="w-full cursor-pointer">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analytics
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/reviews" className="w-full cursor-pointer">
                      <Star className="mr-2 h-4 w-4" />
                      Reviews
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/payments" className="w-full cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payments
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/documents" className="w-full cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      Documents
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/calendar" className="w-full cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" />
                      Calendar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/marketplace" className="w-full cursor-pointer">
                      <Store className="mr-2 h-4 w-4" />
                      Marketplace
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <AuthModal>
                  <Button variant="ghost" className="text-gray-700 hover:text-primary">
                    Sign In
                  </Button>
                </AuthModal>
                <AuthModal>
                  <Button className="button-gradient text-white font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    Get Started
                  </Button>
                </AuthModal>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link href="/find-contractors">
              <span 
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Contractors
              </span>
            </Link>
            <Link href="/post-project">
              <span 
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                Post Project
              </span>
            </Link>
            <Link href="/messaging">
              <span 
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                Messages
              </span>
            </Link>
            
            {/* Mobile Auth Section */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {isAuthenticated && user ? (
                <div className="flex items-center px-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || undefined} alt={user.firstName} />
                    <AvatarFallback className="bg-primary text-white">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              ) : null}
              
              <div className="flex items-center px-3 space-y-2 flex-col">
                {isAuthenticated && user ? (
                  <>
                    <Link href="/profile" className="w-full">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                    {user.userType === "contractor" && (
                      <Link href="/contractor-dashboard" className="w-full">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                          <Briefcase className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                    )}
                    {user.userType === "homeowner" && (
                      <Link href="/user-dashboard" className="w-full">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                          <Home className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <AuthModal>
                      <Button variant="ghost" className="w-full" onClick={() => setIsMenuOpen(false)}>
                        Sign In
                      </Button>
                    </AuthModal>
                    <AuthModal>
                      <Button className="w-full button-gradient text-white" onClick={() => setIsMenuOpen(false)}>
                        Get Started
                      </Button>
                    </AuthModal>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
