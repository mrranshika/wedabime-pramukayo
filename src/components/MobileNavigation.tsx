'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, FileText, Users, Settings, Leaf, TreePine, Sprout, Plus } from 'lucide-react';

interface MobileNavigationProps {
  currentPath?: string;
}

export default function MobileNavigation({ currentPath = '/' }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      description: 'Go to home page'
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: FileText,
      description: 'View site visit records'
    },
    {
      name: 'Customers',
      href: '/customers',
      icon: Users,
      description: 'Manage customer data'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'Application settings'
    }
  ];

  const handleNavigation = (href: string) => {
    setIsOpen(false);
    window.location.href = href;
  };

  return (
    <div className="md:hidden">
      {/* Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-green-200 shadow-lg">
        <div className="flex items-center justify-around py-2">
          {navigationItems.slice(0, 4).map((item) => {
            const isActive = currentPath === item.href;
            const Icon = item.icon;
            
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px] ${
                  isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
                aria-label={item.name}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </button>
            );
          })}
          
          {/* More Options */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors min-w-[60px]">
                <Menu className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh] rounded-t-2xl">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-2 text-green-800">
                  <div className="flex items-center gap-1">
                    <Leaf className="h-5 w-5 text-green-600" />
                    <TreePine className="h-5 w-5 text-emerald-600" />
                    <Sprout className="h-5 w-5 text-teal-600" />
                  </div>
                  Navigation Menu
                </SheetTitle>
                <SheetDescription className="text-green-700">
                  Quick access to all application features
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-2">
                {navigationItems.map((item) => {
                  const isActive = currentPath === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Button
                      key={item.name}
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start h-12 ${
                        isActive 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
                      }`}
                      onClick={() => handleNavigation(item.href)}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs opacity-70">{item.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
              
              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="h-10 text-sm border-green-600 text-green-700 hover:bg-green-50"
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = '/';
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New Entry
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 text-sm border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = '/dashboard';
                    }}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Reports
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Spacer for bottom navigation */}
      <div className="h-16 md:hidden"></div>
    </div>
  );
}