import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component

interface PageHeaderProps {
  onBack?: () => void;
  title?: string; // For simple text titles
  centerNode?: React.ReactNode; // For custom components in the center (e.g., search bar)
  rightNode?: React.ReactNode; // For action buttons or other elements on the right
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  onBack,
  title,
  centerNode,
  rightNode,
}) => {
  return (
    <header className="flex items-center justify-between p-4 border-b flex-shrink-0 sticky top-0 bg-background z-10 h-16">
      {/* Left Section (primarily for back button) */}
      <div className="flex items-center flex-shrink-0 w-1/5">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Terug</span>
          </Button>
        )}
      </div>

      {/* Center Section (for title or custom node) */}
      <div className="flex items-center justify-center flex-1 min-w-0 px-2">
        {centerNode ? (
          centerNode
        ) : title ? (
          <h1 className="font-semibold text-lg truncate" title={title}>
            {title}
          </h1>
        ) : null}
      </div>

      {/* Right Section (for action buttons) */}
      <div className="flex items-center justify-end flex-shrink-0 w-1/5">
        {rightNode}
      </div>
    </header>
  );
};
