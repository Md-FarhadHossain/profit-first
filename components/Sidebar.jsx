"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  Package, 
  X,
  ShoppingCart,
  HatGlasses,
  TrendingUp,
  PackagePlus
} from 'lucide-react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Wrapper to handle toggle and save to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
  };

  // Handle responsive checks
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      label: 'Analytics', 
      path: '/dashboard/analytics', 
      icon: BarChart3 
    },
    // 2. Added the new path here
    { 
      label: 'Abandoned Orders', 
      path: '/dashboard/abandoned-orders', 
      icon: ShoppingCart 
    },
    { 
      label: 'Stock Management', 
      path: '/dashboard/StockManagement', 
      icon: TrendingUp 
    },
    { 
      label: 'Add Order', 
      path: '/dashboard/add-order', 
      icon: PackagePlus 
    },
    { 
      label: 'Block User', 
      path: '/dashboard/block-scammer', 
      icon: HatGlasses 
    },
  ];

  const isActive = (path) => pathname === path;

  return (
    <>
      {/* MOBILE TRIGGER BUTTON (Only visible on mobile) */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-gray-800 text-white rounded-lg border border-gray-700 shadow-lg hover:bg-gray-700 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* MOBILE BACKDROP OVERLAY */}
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
          transition-all duration-300 ease-in-out
          flex flex-col
          ${isMobile 
            ? (isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64') 
            : (isCollapsed ? 'w-20' : 'w-64')
          }
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
              <Link 
                key={item.path} 
                href={item.path}
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
              </Link>
            );
          })}
        </nav>

        {/* FOOTER / COLLAPSE TRIGGER (Desktop Only) */}
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