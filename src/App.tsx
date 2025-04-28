import './App.css';
// Removed BrowserRouter as Router import, it's provided in main.tsx
import { Routes, Route } from 'react-router-dom';
import { NewsletterPage } from './pages/newsletter/NewsletterPage';
import { HomeScreen } from './pages/home/HomeScreen'; 
import { SocialMapScreen } from './pages/map/SocialMapScreen';
import { useState, useEffect } from 'react'; 

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setShowInstallButton(true);
      console.log('`beforeinstallprompt` event fired.');
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('Install prompt not available.');
      return;
    }
    setShowInstallButton(false);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
  };

  return (
    <div className="app-container"> 
      {showInstallButton && (
        <div className="p-3 text-center border-b bg-background sticky top-0 z-10"> 
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-md text-sm"
          >
            Installeer App
          </button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<HomeScreen />} /> 
        <Route path="/nieuws" element={<NewsletterPage />} /> 
        <Route path="/kaart" element={<SocialMapScreen />} /> 
      </Routes>
    </div>
  );
}

export default App;
