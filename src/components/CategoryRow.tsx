import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieCard } from "./MovieCard";
import { useRef } from "react";

interface Movie {
  id: string;
  title: string;
  genre: string;
  year: number;
  rating: number;
  image: string;
  description: string;
  type: 'movie' | 'series';
}

interface CategoryRowProps {
  title: string;
  movies: Movie[];
  onDeleteMovie?: (id: string) => void;
  isEditable?: boolean;
}

export function CategoryRow({ title, movies, onDeleteMovie, isEditable = false }: CategoryRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of approximately 1.5 cards
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (movies.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 sm:mb-12 animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-foreground">{title}</h2>
        
        {/* Navigation Buttons - Hidden on mobile */}
        <div className="hidden sm:flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            className="border-gray-600 hover:bg-gray-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            className="border-gray-600 hover:bg-gray-700"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Movies Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4"
      >
        {movies.map((movie, index) => (
          <div
            key={movie.id}
            className="flex-shrink-0 w-32 sm:w-48 animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <MovieCard
              movie={movie}
              onDelete={onDeleteMovie}
              isEditable={isEditable}
            />
          </div>
        ))}
      </div>
    </div>
  );
}