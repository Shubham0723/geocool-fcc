'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Database,
  Settings,
  Ticket,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Menu,
  X,
  RouteIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    name: 'Master Data',
    icon: Database,
    href: '/master-data',
  },
  {
    name: 'Operation',
    icon: Settings,
    href: '/operation',
  },
  {
    name: 'Tickets',
    icon: Ticket,
    href: '/tickets',
  },
  {
    name: 'Service Schedule',
    icon: RouteIcon,
    href: '/service-schedule',
    children: [
      { name: 'Vehicle Service Schedule', href: '/service-schedule/vehicle' },
      { name: 'AC Service Schedule', href: '/service-schedule/ac' },
    ],
  }
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [openServiceSchedule, setOpenServiceSchedule] = useState<boolean>(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Expand Service Schedule section when navigating within it
  useEffect(() => {
    setOpenServiceSchedule(pathname.startsWith('/service-schedule'));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Redirect to login page
        router.push('/login');
      } else {
        console.error('Logout failed');
        // Still redirect to login page even if logout API fails
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login page even if logout API fails
      router.push('/login');
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300',
          // Mobile: hidden by default, show when menu is open
          'lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          // Mobile: full width when open
          'w-64',
          // Desktop: always visible, with collapse functionality
          'lg:block lg:translate-x-0',
          collapsed ? 'lg:w-16' : 'lg:w-64'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            {!collapsed && (
              <h1 className="text-xl font-bold text-red-600">Dashboard</h1>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-2 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.children && pathname.startsWith(item.href));

              if (item.children) {
                return (
                  <div key={item.href} className="space-y-1">
                    <button
                      onClick={() => setOpenServiceSchedule(!openServiceSchedule)}
                      className={cn(
                        'w-full flex items-center justify-between rounded-lg px-3 py-3 transition-all duration-200',
                        isActive ? 'bg-red-600 text-white shadow-md' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && (
                          <span className="text-sm font-medium">{item.name}</span>
                        )}
                      </span>
                      {!collapsed && <ChevronDown className={cn('h-4 w-4 transition-transform', openServiceSchedule ? 'rotate-180' : 'rotate-0')} />}
                    </button>

                    {!collapsed && openServiceSchedule && (
                      <div className="ml-8 space-y-1">
                        {item.children.map((child) => {
                          const childActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                'flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200',
                                childActive ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                              )}
                            >
                              <span className="truncate">{child.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200',
                    isActive
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="px-2 pb-4">
            <button
              onClick={handleLogout}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200 w-full',
                'text-gray-700 hover:bg-red-50 hover:text-red-600'
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">Logout</span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
