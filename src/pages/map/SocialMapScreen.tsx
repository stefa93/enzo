import { useState, useMemo, lazy, Suspense, useRef, useEffect } from 'react'; // Keep useMemo, Add useRef, Add useEffect
import { useNavigate } from 'react-router-dom';
// Keep TileLayer, Marker imported normally
import { TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet library
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
// Remove unused CardHeader, CardTitle, CardDescription
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import {
    ArrowLeft,
    Search,
    X,
    Map,               // Keep Map icon
    List               // Keep List icon
} from 'lucide-react';

// --- Mock Data ---
const filterCategories = ["Art", "Community", "Sport", "Cultuur"];

// Define a type for location data
type Location = {
    id: number;
    name: string;
    category: string; // Use category for filtering, align with filterCategories
    type: string; // Keep type for display purposes if needed, e.g., in detail sheet subtitle
    address?: string; // Optional address
    description?: string; // Optional description for detail sheet/popup
    contact?: { phone?: string; website?: string; email?: string }; // Optional contact info
    image?: string;   // Optional image for detail sheet
    distance?: string; // Optional distance string (can be calculated later)
    position: L.LatLngExpression; // Use Leaflet's LatLngExpression type
    iconType: 'pin' | 'shirt';
};

// Holendrecht coordinates approx: [52.300, 4.970]
const locations: Location[] = [
    {
        id: 1,
        name: "Service Apotheek Holendrecht - Amsterdam",
        category: "Community", // Assign category matching filters
        type: "Service",
        address: "Holendrechtplein 12, 1106 LN Amsterdam",
        description: "Uw lokale apotheek voor medicijnen en advies.",
        contact: { website: "https://www.serviceapotheek.nl/" },
        position: [52.302, 4.975], // Example coordinates near Holendrecht
        iconType: 'shirt'
    },
    {
        id: 2,
        name: "De Drecht Ouderen wooncentrum",
        category: "Community", // Assign category matching filters
        type: "Gezondheid", // Used in detail sheet subtitle
        address: "Niftrikhof 1, 1106 SB Amsterdam",
        description: "Woonzorgcentrum voor ouderen.",
        image: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=200&h=200&fit=crop", // Placeholder image for detail sheet
        distance: "2 km weg", // For detail sheet (can be calculated)
        position: [52.298, 4.965], // Example coordinates near Holendrecht
        iconType: 'pin'
    },
    {
        id: 3,
        name: "Holendrecht Sportpark",
        category: "Sport", // Assign category matching filters
        type: "Recreatie",
        address: "Sportparklaan 5, 1106 AB Amsterdam",
        description: "Voetbalvelden en andere sportfaciliteiten.",
        position: [52.295, 4.978],
        iconType: 'pin'
    },
     {
        id: 4,
        name: "Cultureel Centrum 'De Hoeksteen'",
        category: "Cultuur", // Assign category matching filters
        type: "Cultuur",
        address: "Cultuurplein 1, 1106 CD Amsterdam",
        description: "Theater, workshops en exposities.",
        position: [52.305, 4.968],
        iconType: 'pin'
    }
];

// --- Custom Icon Logic using L.divIcon ---

// Style for the orange pin marker (De Drecht)
const pinIcon = L.divIcon({
    html: `
        <div class="relative flex items-center justify-center w-7 h-7 bg-orange-500 rounded-full shadow-md border-2 border-white">
            <div class="w-2 h-2 bg-white rounded-full"></div>
           <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-orange-500"></div>
        </div>
    `,
    className: '', // Important to clear default Leaflet styles for divIcon if needed
    iconSize: [28, 28], // Adjust size to match visual appearance
    iconAnchor: [14, 14], // Center the icon anchor
    popupAnchor: [0, -14] // Adjust popup anchor relative to icon center
});

// Style for the red shirt marker (Service Apotheek)
const shirtIcon = L.divIcon({
    html: `
        <div class="relative flex items-center justify-center w-7 h-7 bg-red-500 rounded-full shadow-md border-2 border-white">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shirt"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path></svg>
            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-500"></div>
        </div>
    `,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
});

// Dynamically import MapContainer
const MapContainer = lazy(() => import('react-leaflet').then(module => ({ default: module.MapContainer })));


// --- Component ---

export function SocialMapScreen() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [activeFilter, setActiveFilter] = useState<string | null>(null); // State for active category filter
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map'); // State for map/list view

    // Center coordinates for Holendrecht
    const holendrechtCenter: L.LatLngExpression = [52.300, 4.970];
    const defaultZoom = 15;

    // No change needed for handleMarkerClick or handleCloseSheet for the bottom sheet
    const handleMarkerClick = (location: Location) => {
        setSelectedLocation(location);
        // Optionally, you could also pan the map here:
        // mapRef.current?.flyTo(location.position, defaultZoom);
    };

    const handleCloseSheet = () => {
        setSelectedLocation(null);
    };

    // Ref for accessing map instance
    const mapRef = useRef<L.Map | null>(null);

    // --- Filtering Logic ---
    const filteredLocations = useMemo(() => {
        return locations.filter(loc => {
            const matchesSearch = searchQuery === '' || loc.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = activeFilter === null || loc.category === activeFilter;
            return matchesSearch && matchesFilter;
        });
    }, [ searchQuery, activeFilter]); // Ensure dependencies are correct

    // --- Handlers ---
    const handleFilterClick = (category: string | null) => {
        setActiveFilter(prev => prev === category ? null : category); // Toggle filter
        setSelectedLocation(null); // Close detail sheet when changing filter
    };

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'map' ? 'list' : 'map');
        setSelectedLocation(null); // Close detail sheet when switching views
    };

    const handleShowOnMap = (location: Location) => {
        // Just set the state, let useEffect handle the map movement
        setViewMode('map');
        setSelectedLocation(location);
    };

    // useEffect to handle map animation after view switch and location selection
    useEffect(() => {
        if (viewMode === 'map' && selectedLocation && mapRef.current) {
            // Added a slight delay to ensure map is ready after potential re-renders
            const timer = setTimeout(() => {
                 if (mapRef.current) { // Double check ref just in case
                    mapRef.current.flyTo(selectedLocation.position, defaultZoom);
                 }
            }, 100); // 100ms delay, adjust if needed

            return () => clearTimeout(timer); // Cleanup timer on unmount or dependency change
        }
    }, [viewMode, selectedLocation]); // Dependencies: run when view or selected location changes


    return (
        <div className="flex flex-col h-screen bg-background w-full">

            {/* Top Bar Area (Fixed) */}
            <div className="p-3 pt-12 space-y-3 bg-background z-20 relative shadow-sm"> {/* Added shadow */}
                 {/* Back, Search, View Toggle */}
                 <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="bg-white rounded-full shadow-md h-9 w-9 flex-shrink-0" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5 text-gray-700" />
                    </Button>
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Zoek naar locaties"
                            className="pl-9 pr-9 rounded-full shadow-md h-9 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => setSearchQuery('')}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                     {/* View Toggle Button */}
                     <Button variant="ghost" size="icon" className="bg-white rounded-full shadow-md h-9 w-9 flex-shrink-0" onClick={toggleViewMode}>
                        {viewMode === 'map' ? <List className="h-5 w-5 text-gray-700" /> : <Map className="h-5 w-5 text-gray-700" />}
                    </Button>
                </div>

                 {/* Filter Chips */}
                 <div className="flex space-x-2 overflow-x-auto pb-1">
                    {/* "All" filter option */}
                    <Badge
                        variant={activeFilter === null ? 'default' : 'outline'}
                        className={`cursor-pointer flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border ${activeFilter === null ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90' : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'}`}
                        onClick={() => handleFilterClick(null)}
                    >
                        Alles
                    </Badge>
                    {/* Category filters */}
                    {filterCategories.map((category) => {
                        const isActive = activeFilter === category;
                        const baseStyle = 'cursor-pointer flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border';
                        let activeStyle = '';
                        let inactiveStyle = '';

                        // Define styles based on category and active state
                         switch (category) {
                            case 'Sport':
                                activeStyle = 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600';
                                inactiveStyle = 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
                                break;
                            case 'Cultuur':
                                activeStyle = 'bg-orange-500 text-white border-orange-600 hover:bg-orange-600';
                                inactiveStyle = 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200';
                                break;
                            case 'Community':
                                activeStyle = 'bg-red-500 text-white border-red-600 hover:bg-red-600';
                                inactiveStyle = 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
                                break;
                            default: // Art or others
                                activeStyle = 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600'; // Example for 'Art'
                                inactiveStyle = 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
                        }

                        return (
                            <Badge
                                key={category}
                                variant={isActive ? 'default' : 'outline'} // Use variant to help differentiate
                                className={`${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}
                                onClick={() => handleFilterClick(category)} // Use handler
                            >
                                {category}
                            </Badge>
                        );
                    })}
                </div>
            </div>

            {/* Content Area (Map or List) */}
            <div className="flex-grow relative overflow-hidden">

                {/* --- Conditional Rendering: Map or List --- */}
                {viewMode === 'map' ? (
                    /* --- Leaflet Map Container (Lazy Loaded) --- */
                    <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center bg-gray-200">Loading map...</div>}>
                        <MapContainer
                            // Remove key={activeFilter} - likely not needed and simplifies things
                            center={holendrechtCenter}
                            zoom={defaultZoom}
                            scrollWheelZoom={true}
                            className="absolute inset-0 z-0" // Map is behind overlays
                            ref={mapRef} // Assign map instance to ref
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {/* --- Map Markers (Filtered) --- */}
                            {filteredLocations.map((loc) => ( // Use filteredLocations
                                <Marker
                                    key={loc.id}
                                    position={loc.position}
                                    icon={loc.iconType === 'pin' ? pinIcon : shirtIcon} // Apply the divIcons
                                    eventHandlers={{
                                        click: () => {
                                            handleMarkerClick(loc);
                                        },
                                    }}
                                >
                                    {/* Remove the default Leaflet Popup - We use the bottom sheet */}
                                    {/* <Popup>
                                        <b>{loc.name}</b><br />
                                        {loc.type}
                                    </Popup> */}
                                </Marker>
                            ))}
                            {/* --- End Map Markers --- */}
                        </MapContainer>
                    </Suspense>
                    /* --- End Map View --- */
                ) : (
                    /* --- List View --- */
                    <div className="absolute inset-0 overflow-y-auto p-3 space-y-3 z-0 bg-background"> {/* Ensure background */}
                        {filteredLocations.length > 0 ? ( // Use filteredLocations
                            filteredLocations.map((loc) => (
                                // Remove onClick from Card - clicking card does nothing now
                                <Card key={loc.id} className="overflow-hidden shadow-md rounded-lg bg-card">
                                    <CardContent className="p-3 flex items-start space-x-3">
                                        {loc.image && (
                                            <Avatar className="h-16 w-16 rounded-md flex-shrink-0 mt-1">
                                                <AvatarImage src={loc.image} alt={loc.name} className="object-cover"/>
                                                <AvatarFallback>{loc.name.substring(0, 1)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        {/* Wrap text content and button in a flex container */}
                                        <div className="flex flex-grow min-w-0 justify-between items-start space-x-2">
                                            {/* Text content */}
                                            <div className="flex-grow space-y-1">
                                                <h3 className="font-semibold text-sm">{loc.name}</h3>
                                                <p className="text-xs text-muted-foreground">{loc.type}</p>
                                                {loc.address && <p className="text-xs text-muted-foreground">{loc.address}</p>}
                                                {loc.distance && <p className="text-xs text-muted-foreground">{loc.distance}</p>}
                                            </div>
                                            {/* Button and Category Badge Column */}
                                            <div className="flex flex-col items-end flex-shrink-0 space-y-1">
                                                 <Badge variant="secondary" className="self-end">{loc.category}</Badge>
                                                 <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="p-0 h-auto text-xs text-primary mt-1" // smaller size and margin top
                                                    onClick={() => handleShowOnMap(loc)}
                                                >
                                                    Toon op kaart
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground pt-10">
                                Geen locaties gevonden die voldoen aan de criteria.
                            </div>
                        )}
                         {/* Add padding at the bottom to avoid overlap with nav bar */}
                         <div className="h-16"></div>
                    </div>
                    /* --- End List View --- */
                )}

                {/* --- Detail Sheet (Conditional) - Renders above Map/List --- */}
                {selectedLocation && (
                    <div
                        className="absolute bottom-[calc(env(safe-area-inset-bottom,0rem)+4rem)] left-3 right-3 z-30 transition-all duration-300 ease-out transform translate-y-0" // Adjusted bottom position for nav bar
                    >
                        {/* Added explicit close button inside the Card */}
                        <Card className="overflow-hidden shadow-xl rounded-lg bg-white relative"> {/* Ensure background and relative positioning */}
                             <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 z-10 bg-white/70 rounded-full" // z-10 to be above content
                                onClick={(e) => { e.stopPropagation(); handleCloseSheet(); }}
                            >
                                <X className="h-4 w-4 text-gray-600" />
                            </Button>
                            <CardContent className="p-3 flex items-center space-x-3">
                                {selectedLocation.image && (
                                    <Avatar className="h-12 w-12 rounded-md flex-shrink-0">
                                        <AvatarImage src={selectedLocation.image} alt={selectedLocation.name} className="object-cover"/>
                                        <AvatarFallback>{selectedLocation.name.substring(0, 1)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className="flex-grow min-w-0">
                                    <h3 className="font-semibold text-sm truncate">{selectedLocation.name}</h3>
                                    <p className="text-xs text-muted-foreground">{selectedLocation.type}</p>
                                    {selectedLocation.address && <p className="text-xs text-muted-foreground mt-1">{selectedLocation.address}</p>}
                                </div>
                                {selectedLocation.distance && (
                                     <p className="text-xs text-muted-foreground flex-shrink-0">{selectedLocation.distance}</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
                {/* --- End Detail Sheet --- */}

            </div> {/* End Content Area */}

            {/* Bottom Navigation */}
            <BottomNavigation />
        </div>
    );
}