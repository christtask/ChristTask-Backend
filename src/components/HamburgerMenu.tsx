// @ts-nocheck - Temporary disable for missing dependencies
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, MessageSquare, LayoutDashboard, Settings, User } from "lucide-react";

interface HamburgerMenuProps {
  isCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

export const HamburgerMenu = ({ isCollapsed = false }: HamburgerMenuProps) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: MessageSquare, label: 'Chatbot', path: '/chatbot' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-[#1a1a1a] border-r border-[#222] z-[1000] flex flex-col shadow-2xl transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-[280px]'
        }`} 
        style={{ minHeight: '100vh' }}
      >
        {/* Brand Section */}
        <div className={`flex items-center space-x-3 px-6 py-6 border-b border-[#222] ${isCollapsed ? 'justify-center px-2' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">CT</span>
          </div>
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-white tracking-wide">ChristTask</h2>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-6 space-y-8">
          <div>
            {!isCollapsed && (
              <div className="text-xs uppercase tracking-widest text-[#888888] px-4 mb-2">Main</div>
            )}
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all text-left font-medium text-zinc-200 hover:bg-[#232323] focus:outline-none focus:bg-[#232323] ${
                      window.location.pathname === item.path ? 'bg-[#18181b] text-[#8B5CF6]' : ''
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="ml-3">{item.label}</span>}
                  </button>
                </li>
              ))}
              {/* Sign In Button */}
              <li>
                <button
                  onClick={() => navigate('/login')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all text-left font-medium text-blue-400 hover:bg-[#232323] focus:outline-none focus:bg-[#232323] ${isCollapsed ? 'justify-center px-2' : ''}`}
                  title={isCollapsed ? 'Sign In' : undefined}
                >
                  <User className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3">Sign In</span>}
                </button>
              </li>
            </ul>
          </div>
        </nav>
        
        {/* User/Profile Section */}
        <div className={`px-6 py-6 border-t border-[#222] ${isCollapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            {!isCollapsed && (
              <div>
                <div className="text-sm font-semibold text-white">Guest</div>
                <div className="text-xs text-[#888888]">Not signed in</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}; 