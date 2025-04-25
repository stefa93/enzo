import './App.css';
// Removed BrowserRouter as Router import, it's provided in main.tsx
import { Routes, Route } from 'react-router-dom';
import { NewsletterPage } from './pages/newsletter/NewsletterPage';
import { HomeScreen } from './pages/home/HomeScreen'; 
import { SocialMapScreen } from './pages/map/SocialMapScreen';

function App() {
  return (
      <Routes>
          <Route path="/" element={<HomeScreen />} /> {/* Route for the Home screen */}
          <Route path="/nieuws" element={<NewsletterPage />} /> {/* Route for the News List */}
          {/* Add other routes here as needed */}
          <Route path="/kaart" element={<SocialMapScreen />} /> 
        </Routes>
      
    // Removed the redundant </Router> wrapper
  );
}

export default App;
