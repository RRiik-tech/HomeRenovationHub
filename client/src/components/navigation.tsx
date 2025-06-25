import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, X, Home, Search, PlusCircle, MessageSquare, User, Briefcase, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import AuthModal from "@/components/auth-modal";

export default function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold gradient-text">
                HomeConnect Pro
              </h1>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-8">
                <Link href="/find-contractors">
                  <span className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    isActive("/find-contractors") ? "text-primary" : "text-gray-700 hover:text-primary"
                  }`}>
                    Find Contractors
                  </span>
                </Link>
                <Link href="/post-project">
                  <span className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    isActive("/post-project") ? "text-primary" : "text-gray-700 hover:text-primary"
                  }`}>
                    Post Project
                  </span>
                </Link>
                <Link href="/messaging">
                  <span className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    isActive("/messaging") ? "text-primary" : "text-gray-700 hover:text-primary"
                  }`}>
                    Messages
                  </span>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-700 hover:text-primary">
              Sign In
            </Button>
            <Button className="button-gradient text-white font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              Get Started
            </Button>
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
              <span className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary cursor-pointer">
                Find Contractors
              </span>
            </Link>
            <Link href="/post-project">
              <span className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary cursor-pointer">
                Post Project
              </span>
            </Link>
            <Link href="/messaging">
              <span className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary cursor-pointer">
                Messages
              </span>
            </Link>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-3 space-y-2 flex-col">
                <Button variant="ghost" className="w-full">
                  Sign In
                </Button>
                <Button className="w-full button-gradient text-white">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
