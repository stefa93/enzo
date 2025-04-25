import{ useState, useEffect } from 'react';
import { NewsListView } from './NewsListView';
import { NewsDetailView } from './NewsDetailView';
import { fetchNewsItems, mapStrapiItemToFrontend, FrontendItem } from '@/lib/strapi';

type View = 'list' | 'detail';

export const NewsletterPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [items, setItems] = useState<FrontendItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const strapiItems = await fetchNewsItems();
        console.log("[NewsletterPage] Fetched Strapi items:", strapiItems); 
        const frontendItems = strapiItems
          .map(mapStrapiItemToFrontend)
          .filter((item): item is FrontendItem => item !== null); 
        console.log("[NewsletterPage] Mapped Frontend items:", frontendItems); 
        setItems(frontendItems);
        setError(null); 
      } catch (err) {
        console.error("Error fetching newsletter items:", err);
        setError('Kon nieuwsberichten niet laden.');
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setCurrentView('detail');
  };

  const handleGoBack = () => {
    setCurrentView('list');
    setSelectedItemId(null);
  };

  const selectedItem = items.find(item => item.id === selectedItemId);

  if (isLoading) {
    return <div className="p-4">Laden...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="newsletter-page">
      {currentView === 'list' ? (
        <NewsListView items={items} onSelectItem={handleSelectItem} />
      ) : selectedItem ? (
        <NewsDetailView item={selectedItem} goBack={handleGoBack} />
      ) : (
        <div>Item niet gevonden. <button onClick={handleGoBack} className="text-blue-600">Terug naar lijst</button></div>
      )}
    </div>
  );
};
