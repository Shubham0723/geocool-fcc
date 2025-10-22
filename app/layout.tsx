'use client';

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/Sidebar';
import { Toaster } from '@/components/ui/toaster';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          if (!isLoginPage) {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        if (!isLoginPage) {
          router.push('/login');
        }
      }
    };

    if (!isLoginPage) {
      checkAuth();
    } else {
      setIsAuthenticated(true); // Allow login page to render
    }
  }, [pathname, isLoginPage, router]);

  // Show loading while checking authentication
  if (!isLoginPage && isAuthenticated === null) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Checking authentication...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isLoginPage && !isAuthenticated) {
    return null;
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        {isLoginPage ? (
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        ) : (
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 ml-64 transition-all duration-300 w-full max-w-full overflow-hidden">
              {children}
            </main>
          </div>
        )}
        <Toaster />
      </body>
    </html>
  );
}
