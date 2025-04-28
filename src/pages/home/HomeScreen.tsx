import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import {
  fetchHomepageContent,
  mapStrapiHomepageToFrontend,
  FrontendHomepageContent,
  FrontendHomepageCard // Import the card type
} from '@/lib/strapi'; // Assuming strapi.ts is in lib

// Default image if Strapi doesn't provide one
const DEFAULT_CARD_IMAGE = "https://images.unsplash.com/photo-1617957689233-5ae6f64f0b8b?q=80&w=300&h=300&fit=crop"; // Generic placeholder
const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?q=80&w=1920"; // Default hero

export function HomeScreen() {
  const [homepageData, setHomepageData] = useState<FrontendHomepageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHomepageData() {
      setIsLoading(true);
      setError(null);
      console.log("[HomeScreen] Starting data load...");
      try {
        const strapiData = await fetchHomepageContent();
        // Log fetched data
        console.log("[HomeScreen] Fetched Strapi data:", strapiData ? JSON.stringify(strapiData, null, 2) : 'null');

        const frontendData = mapStrapiHomepageToFrontend(strapiData);
        // Log mapped data
        console.log("[HomeScreen] Mapped frontend data:", frontendData ? JSON.stringify(frontendData, null, 2) : 'null');

        setHomepageData(frontendData);
        // Confirm state was set (won't show updated value immediately due to async nature)
        console.log("[HomeScreen] Called setHomepageData.");

      } catch (err) {
        console.error("Error fetching or mapping homepage data:", err);
        setError("Kon de homepage gegevens niet laden."); // User-friendly error
      } finally {
        setIsLoading(false);
        console.log("[HomeScreen] Data loading finished.");
      }
    }

    loadHomepageData();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="flex flex-col min-h-screen bg-background w-full">

      {/* Hero Section - Dynamic */}
      <div
        className="relative h-72 md:h-80 bg-cover bg-center bg-gray-400" // Added fallback bg color
        style={{ backgroundImage: `url('${homepageData?.heroBackgroundImageUrl || DEFAULT_HERO_IMAGE}')` }}
      >
        {/* App Name */}
        <div className="absolute top-8 left-4">
          <h2 className="text-white text-lg font-bold">1106enZO</h2>
        </div>

        {/* Main Text - Dynamic */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent flex flex-col justify-end p-6">
          <p className="text-white text-3xl font-bold leading-tight drop-shadow">
            {isLoading ? "Laden..." : (homepageData?.heroTitle || "Welkom bij 1106enZO")}
          </p>
        </div>
      </div>

      {/* Main Content Grid - Dynamic */}
      <main className="flex-grow p-4 w-full max-w-6xl mx-auto">
        {isLoading && <p className="text-center">Homepage wordt geladen...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {!isLoading && !error && homepageData && (
          <>
            {homepageData.cardSectionTitle && (
              <h2 className="text-2xl font-semibold mb-4">{homepageData.cardSectionTitle}</h2>
            )}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
              {homepageData.cards.map((card: FrontendHomepageCard) => ( // Explicitly type card
                <Link to={card.link} key={card.id} className="block group">
                  <Card className="overflow-hidden rounded-3xl border-none shadow-none hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-0 relative">
                      <AspectRatio ratio={1 / 1}>
                        <img
                          src={card.imageUrl || DEFAULT_CARD_IMAGE} // Use fetched or default image
                          alt={card.title}
                          className="object-cover w-full h-full bg-gray-200 rounded-3xl" // Added fallback bg and rounding
                        />
                        <div className="absolute inset-0 flex items-end justify-start p-4 bg-gradient-to-t from-black/60 to-transparent">
                          <h3 className="text-white text-lg font-semibold drop-shadow">{card.title}</h3>
                        </div>
                      </AspectRatio>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
        {!isLoading && !error && !homepageData && (
          <p className="text-center">Geen homepage gegevens gevonden.</p>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}