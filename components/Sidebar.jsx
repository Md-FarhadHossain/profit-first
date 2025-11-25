"use client"
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  Package, 
  X,
  ShoppingCart
} from 'lucide-react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // New state to track if component is ready
  
  // Simulating navigation for this demo since we can't use next/navigation
  const [currentPath, setCurrentPath] = useState('/dashboard');

  useEffect(() => {
    // 1. Set initial state based on window and localStorage
    const handleResize = () => {
      // Check if window is defined to avoid errors
      if (typeof window !== 'undefined') {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (!mobile) {
          setIsMobileOpen(false);
        }
      }
    };

    // Load saved collapsed state
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("sidebarCollapsed");
      if (saved !== null) {
        setIsCollapsed(JSON.parse(saved));
      }
    }

    // Check size immediately
    handleResize();
    
    // 2. Set mounted to true to enable transitions after initial render
    // This slight delay ensures the CSS has time to apply the initial state without animating
    requestAnimationFrame(() => {
      setIsMounted(true);
    });

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
  };

  // Close mobile menu when "route" changes
  const handleNavigation = (path) => {
    setCurrentPath(path);
    setIsMobileOpen(false);
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Abandoned Orders', path: '/dashboard/abandoned-orders', icon: ShoppingCart }
  ];

  const isActive = (path) => currentPath === path;

  // Helper to determine width classes safely
  const getSidebarWidth = () => {
    // If we haven't mounted yet, default to desktop open width or hidden on mobile via CSS logic below
    if (!isMounted) return 'w-64'; 
    if (isMobile) return 'w-64';
    return isCollapsed ? 'w-20' : 'w-64';
  };

  // Helper to determine transform/visibility classes
  const getSidebarTransform = () => {
    // CRITICAL FIX: If not mounted, force hide on mobile (CSS handles desktop)
    // This prevents the mobile sidebar from flashing on screen during load
    if (!isMounted) return 'max-md:-translate-x-full'; 
    
    if (isMobile) {
      return isMobileOpen ? 'translate-x-0' : '-translate-x-full';
    }
    return 'translate-x-0';
  };

  return (
    <>
      {/* MOBILE TRIGGER BUTTON */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-gray-800 text-white rounded-lg border border-gray-700 shadow-lg hover:bg-gray-700 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* MOBILE BACKDROP */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50
          h-screen bg-gray-900 border-r border-gray-800 
          flex flex-col
          
          ${getSidebarWidth()}
          ${getSidebarTransform()}

          /* Only animate AFTER mounting to prevent the "slide in" glitch on refresh */
          ${isMounted ? 'transition-all duration-300 ease-in-out' : ''}
        `}
      >
        {/* LOGO AREA */}
        <div className={`h-16 flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between px-6'} border-b border-gray-800`}>
          
          {!isCollapsed || isMobile ? (
            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
              <div className="p-1.5 bg-blue-600 rounded-lg shrink-0">
                <Package size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                BookOrder
              </span>
            </div>
          ) : (
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Package size={20} className="text-white" />
            </div>
          )}

          {/* Mobile Close Button */}
          {isMobile && (
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* NAVIGATION ITEMS */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <a 
                key={item.path} 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(item.path);
                }}
                className={`
                  relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                  ${active 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }
                  ${isCollapsed && !isMobile ? 'justify-center' : ''}
                `}
              >
                <item.icon size={22} className={`${active ? 'text-white' : 'text-gray-400 group-hover:text-white'} shrink-0`} />
                
                {(!isCollapsed || isMobile) && (
                  <span className="font-medium text-sm whitespace-nowrap">
                    {item.label}
                  </span>
                )}

                {/* Tooltip for Collapsed Mode */}
                {isCollapsed && !isMobile && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded hidden group-hover:block whitespace-nowrap z-50 border border-gray-700 shadow-xl">
                    {item.label}
                  </div>
                )}
              </a>
            );
          })}
        </nav>

        {/* FOOTER / COLLAPSE TRIGGER */}
        {!isMobile && (
          <div className="p-4 border-t border-gray-800 flex justify-end">
            <button
              onClick={toggleCollapse}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}