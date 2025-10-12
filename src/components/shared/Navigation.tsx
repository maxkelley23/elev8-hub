'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const isHome = pathname === '/';

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

          {/* Navigation Actions */}
          <div className="flex items-center space-x-4">
            {!isHome && (
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Hub</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
