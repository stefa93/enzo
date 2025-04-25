import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, Heart, MessageCircle, Bookmark, MoreHorizontal, X, Calendar, User } from 'lucide-react';
import { BottomNavigation } from '@/components/layout/BottomNavigation'; 
import React, { useState, useMemo } from 'react'; 
import type { FrontendItem } from "@/lib/strapi";

interface NewsListViewProps {
  onSelectItem: (itemId: string) => void;
  items: FrontendItem[];
}

const formatDate = (isoDateString: string) => {
  const date = new Date(isoDateString);
  return date.toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const NewsListView: React.FC<NewsListViewProps> = ({ items, onSelectItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'news' | 'event' | 'story'>('all');

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(lowerSearchTerm) ||
        (item.description && item.description.toLowerCase().includes(lowerSearchTerm))
      );
    }

    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchTerm, selectedCategory, items]);

  return (
    <div className="bg-background font-sans min-h-screen flex flex-col w-full">

      <div className="flex-grow w-full max-w-6xl mx-auto flex flex-col">
        <header className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">Buurtkrant</h1>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
        </header>

        <div className="p-4 space-y-4 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek naar artikelen, evenementen..."
              className="pl-10 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchTerm('')} 
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-1">
            <Badge variant={selectedCategory === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setSelectedCategory('all')}>Alles</Badge>
            <Badge variant={selectedCategory === 'news' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setSelectedCategory('news')}>Nieuws</Badge>
            <Badge variant={selectedCategory === 'event' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setSelectedCategory('event')}>Evenementen</Badge>
            <Badge variant={selectedCategory === 'story' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setSelectedCategory('story')}>Verhalen</Badge>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow">
          {filteredAndSortedItems.length > 0 ? (
            filteredAndSortedItems.map(item => (
              <div
                key={item.id}
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  onSelectItem(item.id);
                }}
              >
                <Card className="overflow-hidden h-full flex flex-col">
                  {item.imageUrl && (
                    <AspectRatio ratio={16 / 10}>
                      <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full" />
                    </AspectRatio>
                  )}
                  <CardHeader className="p-3 pb-2">
                    <Badge variant="secondary" className="w-fit capitalize text-xs mb-1.5">
                      {item.category === 'event' ? 'Evenement' : item.category === 'story' ? 'Verhaal' : 'Nieuws'}
                    </Badge>
                    <CardTitle className="text-base font-semibold leading-tight mb-1">{item.title}</CardTitle>
                    <div className="flex items-center text-xs text-muted-foreground mb-1">
                      {item.category !== 'event' && item.author && ( 
                        <>
                          <Avatar className="h-4 w-4 mr-1.5">
                            <AvatarImage src={`https://avatar.vercel.sh/${item.author.replace(' ','')}.png`} alt={item.author} />
                            <AvatarFallback>{item.author.substring(0,1)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate mr-1">{item.author}</span>
                          <span className="mx-1">•</span>
                        </>
                      )}
                      <Calendar className="h-3.5 w-3.5 mr-1"/>
                      <span>{formatDate(item.date)}</span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground leading-snug line-clamp-3">{item.description}</p>
                    )}
                  </CardHeader>

                  {item.category === 'news' && item.comments !== undefined && (
                    <CardFooter className="flex justify-between items-center text-xs text-muted-foreground p-3 pt-1 mt-auto">
                      <div className="flex items-center space-x-0.5">
                        <MessageCircle className="h-3 w-3" />
                        <span>{item.comments}</span>
                      </div>
                      <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Bookmark className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardFooter>
                  )}

                  {item.category === 'event' && item.author && (
                    <CardFooter className="text-xs text-muted-foreground p-3 pt-0 mt-auto">
                      <span className="flex items-center"><User className="h-3.5 w-3.5 mr-1"/> Door: {item.author}</span>
                    </CardFooter>
                  )}
                </Card>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground col-span-full">Geen resultaten gevonden die voldoen aan de criteria.</p>
          )}
        </div>
      </div> 

      <BottomNavigation />
    </div>
  );
}