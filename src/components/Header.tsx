import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Cross, 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  BookOpen, 
  MessageSquare,
  Heart,
  ExternalLink
} from "lucide-react";

interface HeaderProps {
  onLogoClick: () => void;
  onAuthAction?: (action: 'signin' | 'signup') => void;
  onSignOut?: () => void;
  user?: any;
  isGuest?: boolean;
  className?: string;
  variant?: 'landing' | 'app';
}

export const Header = ({ 
  onLogoClick, 
  onAuthAction, 
  onSignOut, 
  user, 
  isGuest = false,
  className = "",
  variant = "landing"
}: HeaderProps) => {
  const isAuthenticated = user || isGuest;

  return (
    <header className={`relative z-10 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity duration-300"
            onClick={onLogoClick}
          >
            <div className={`w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center ${
              variant === 'landing' ? 'animate-glow' : ''
            }`}>
              <Cross className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white hover:text-purple-400 transition-colors duration-300">ChristTask</h1>
          </div>

          {/* Navigation Menu - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className="text-white/80 hover:text-white transition-colors duration-200"
            >
              Features
            </a>
            <a 
              href="#testimonials" 
              className="text-white/80 hover:text-white transition-colors duration-200"
            >
              Testimonials
            </a>
            <a 
              href="#resources" 
              className="text-white/80 hover:text-white transition-colors duration-200"
            >
              Resources
            </a>
            <a 
              href="#about" 
              className="text-white/80 hover:text-white transition-colors duration-200"
            >
              About
            </a>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="hidden sm:flex items-center space-x-2 text-sm text-white/80">
                  <User className="w-4 h-4" />
                  <span>{user?.email || 'Guest User'}</span>
                  {isGuest && (
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs">
                      Guest
                    </span>
                  )}
                </div>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      <Menu className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      My Conversations
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center">
                      <Heart className="w-4 h-4 mr-2" />
                      Support Us
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Resources
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center text-red-600"
                      onClick={onSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => onAuthAction?.('signin')}
                  className="text-white hover:bg-white/10"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => onAuthAction?.('signup')}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
