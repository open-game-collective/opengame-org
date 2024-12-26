import { Link } from "@remix-run/react";
import { useState } from "react";

interface NavigationProps {
  userEmail: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function Navigation({ userEmail, isOpen, onOpenChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationLinks = [
    {
      name: "Dashboard",
      href: "/",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Results",
      href: "/results",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      name: "Transactions",
      href: "/transactions",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
    {
      name: "Wallet",
      href: "/wallet",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
  ];

  const learnLinks = [
    {
      name: "How to Play",
      href: "/learn",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className={`
          lg:hidden fixed top-0 left-0 z-50
          h-16 w-16 flex items-center justify-center
          bg-transparent
          text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
          focus:outline-none
          transition-all duration-300
          ${isOpen ? 'translate-x-64' : 'translate-x-0'}
        `}
        onClick={() => onOpenChange(!isOpen)}
      >
        {isOpen ? (
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
      )}

      {/* Navigation sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 z-40">
        <div className="flex flex-col h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <NavigationContent 
            userEmail={userEmail} 
            navigationLinks={navigationLinks}
            learnLinks={learnLinks}
            onNavigate={() => onOpenChange(false)}
          />
        </div>
      </div>

      {/* Mobile navigation */}
      <div className={`
        lg:hidden fixed inset-y-0 left-0 z-40 w-64
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        transition-transform duration-300 ease-in-out
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
      `}>
        <NavigationContent 
          userEmail={userEmail} 
          navigationLinks={navigationLinks}
          learnLinks={learnLinks}
          onNavigate={() => onOpenChange(false)}
        />
      </div>
    </>
  );
}

// Separate component for navigation content to avoid duplication
function NavigationContent({
  userEmail,
  navigationLinks,
  learnLinks,
  onNavigate,
}: {
  userEmail: string;
  navigationLinks: Array<{ name: string; href: string; icon: React.ReactNode }>;
  learnLinks: Array<{ name: string; href: string; icon: React.ReactNode }>;
  onNavigate: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
        <Link to="/" className="flex items-center gap-3" onClick={onNavigate}>
          <img src="/logo.svg" alt="OGC Logo" className="h-8 w-8" />
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Open Game</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigationLinks.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 group"
            onClick={onNavigate}
          >
            <div className="mr-4 flex-shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400">
              {item.icon}
            </div>
            <span className="flex-1 whitespace-nowrap">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Learn Section */}
      <div className="px-2 py-4 space-y-1 border-t border-gray-200 dark:border-gray-800">
        <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Learn
        </h3>
        {learnLinks.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 group"
            onClick={onNavigate}
          >
            <div className="mr-4 flex-shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400">
              {item.icon}
            </div>
            {item.name}
          </Link>
        ))}
      </div>

      {/* User Section */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
        <Link to="/account" className="flex items-center" onClick={onNavigate}>
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              {userEmail === "User" ? "U" : userEmail[0].toUpperCase()}
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {userEmail}
            </p>
          </div>
        </Link>
      </div>
    </>
  );
}
