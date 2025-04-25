import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Bookmark, Upload, SquareArrowUp, Calendar } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import type { FrontendItem } from '@/lib/strapi'; // Import FrontendItem type

// Helper function to format date nicely
const formatDate = (isoDateString: string | undefined) => {
  if (!isoDateString) return '';
  const date = new Date(isoDateString);
  return date.toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

interface NewsDetailViewProps {
  item: FrontendItem; // Receive the full item object
  goBack: () => void; // Function to navigate back
}

export const NewsDetailView: React.FC<NewsDetailViewProps> = ({ item, goBack }) => {

  // If item data is not yet loaded or not found, show a loading/error message
  if (!item) {
    // This case should ideally be handled by the parent (NewsletterPage),
    // but include a fallback here.
    return (
      <div className="p-4">
        <button onClick={goBack} className="flex items-center text-blue-600 mb-4">
          <ArrowLeft size={18} className="mr-1" /> Terug
        </button>
        <div>Item niet gevonden.</div>
      </div>
    );
  }

  // Determine category display name
  const categoryName = item.category === 'event' ? 'Evenement' : item.category === 'story' ? 'Verhaal' : 'Nieuws';

  return (
    // Increased large screen max-width to match HomeScreen
    <div className="bg-background font-sans max-w-md mx-auto lg:max-w-6xl flex flex-col min-h-screen">
       {/* Header - max-width is now handled by the parent div on large screens */}
       <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Terug</span>
        </Button>
        <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
                <Bookmark className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
                <SquareArrowUp className="h-5 w-5" /> 
            </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-grow">
        {/* Hero Image (if available) */} 
        {item.imageUrl && (
          <div className="relative mb-4">
            <AspectRatio ratio={16 / 10}>
              <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full" />
            </AspectRatio>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <h2 className="text-white font-bold text-xl">{item.title}</h2>
              {/* Combine category and date for subtitle */}
              <p className="text-white text-xs capitalize"><Badge variant="secondary" className="text-xs mr-1.5 h-auto px-1.5 py-0.5">{categoryName}</Badge>• {formatDate(item.date)}</p>
            </div>
          </div>
        )}
 
        <div className="p-4 space-y-4">
            {/* Title and Author/Date */} 
            <div>
              <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
              <div className="flex items-center text-sm text-muted-foreground mb-3">
                {item.author && ( 
                  <>
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={`https://avatar.vercel.sh/${item.author.replace(' ','')}.png`} alt={item.author} />
                      <AvatarFallback>{item.author.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <span>{item.author}</span>
                    <span className="mx-1.5">•</span>
                  </>
                )} 
                {/* Always show date */}
                <Calendar className="h-4 w-4 mr-1 ml-1"/>
                <span>{formatDate(item.date)}</span>
              </div>
              <Separator />
            </div>
 
            {/* Article Content */} 
            <article className="prose prose-sm max-w-none text-foreground"> 
              {/* Render Rich Text Content using ReactMarkdown */} 
              {item.content ? (
                <ReactMarkdown>{item.content}</ReactMarkdown>
              ) : ( 
                <p>{item.description || 'Geen inhoud beschikbaar.'}</p> // Fallback to description
              )} 
            </article>
 
             {/* Inline Image */}
             {item.inlineImageUrl && (
                <AspectRatio ratio={16 / 9} className="rounded-md overflow-hidden my-5">
                  <img src={item.inlineImageUrl} alt="Inline image" className="object-cover w-full h-full" />
                </AspectRatio>
             )}
 
            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
                 <Button className="w-full">
                    <Upload className="mr-2 h-4 w-4" /> Deel dit artikel
                 </Button>
                 <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Ga terug
                 </Button>
            </div>
        </div>
      </div>

      {/* Reusable Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}