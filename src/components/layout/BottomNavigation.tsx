// src/components/layout/BottomNavigation.tsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Newspaper } from 'lucide-react';
import { Button } from '../ui/button'; // Import the Button component
import { cn } from '@/lib/utils';

// Define nav items centrally
const navItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Nieuws", icon: Newspaper, path: "/nieuws" },
  { label: "Kaart", icon: Newspaper, path: "/kaart" },
];

export function BottomNavigation() {
  const location = useLocation();
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
       if (Math.abs(currentScrollY - lastScrollY.current) > 5) {
          lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    // Footer with sticky positioning and scroll-based transform
    <footer
      className={cn(
        "sticky bottom-0 left-0 right-0 bg-background border-t p-2 flex justify-around items-center w-full",
        "transition-transform duration-300 ease-in-out",
        isHidden ? "translate-y-full" : "translate-y-0"
      )}
      // Prevent interaction when hidden
      style={isHidden ? { pointerEvents: 'none' } : {}}
    >
      {/* Map over navItems to create buttons dynamically */}
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const IconComponent = item.icon;
        return (
          // Link provides navigation functionality
          <Link key={item.label} to={item.path} className="flex-1 flex justify-center">
            {/* Button provides styling, using Link as its child */}
            <Button
              variant="ghost"
              className={cn(
                "flex flex-col items-center h-auto px-2 py-1 w-auto", // Base layout styling for the button content
                isActive ? "text-primary" : "text-muted-foreground" // Active/inactive text color
              )}
              asChild // Render the Link child instead of a <button> element
            >
              {/* Content inside the Button (which is now acting on the Link) */}
              <div> {/* This div is required by asChild structure sometimes, helps contain content */}
                  <IconComponent className="h-5 w-5 mb-0.5" />
                  <span className="text-xs">{item.label}</span>
              </div>
            </Button>
          </Link>
        );
      })}
    </footer>
  );
}