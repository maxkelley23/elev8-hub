'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ArrowLeft, Megaphone, FolderOpen, DollarSign } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const navLinks = [
    { href: '/campaigns', label: 'Campaigns', icon: FolderOpen },
    { href: '/campaigns/new', label: 'New Campaign', icon: Megaphone },
    { href: '/expenses', label: 'Expenses', icon: DollarSign },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Elev8 Hub</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {!isHome && navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href ||
                (link.href === '/campaigns' && pathname.startsWith('/campaigns'));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <Link
              href="/"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Hub</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
