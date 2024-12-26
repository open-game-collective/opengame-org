import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-25 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="h-16 flex items-center px-4">
        {/* Title with increased spacing from left edge on mobile */}
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white ml-20 lg:ml-0">{title}</h1>

        {/* Right section */}
        <div className="flex-1 flex justify-end">
          {children}
        </div>
      </div>
    </header>
  );
} 