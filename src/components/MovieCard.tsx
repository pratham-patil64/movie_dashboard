import { useState } from "react";
import { Star, Play, Plus, Info } from "lucide-react"; // Import Info icon
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MovieDetailsModal } from "./MovieDetailsModal"; // Import the new modal

interface Movie {
  id: string;
  title: string;
  genre: string;
  year: number;
  rating: number;
  image: string;
  description: string;
  type: 'movie' | 'series';
  trailer_url?: string;
}

interface MovieCardProps {
  movie: Movie;
  onDelete?: (id: string) => void;
  isEditable?: boolean;
}

export function MovieCard({ movie, onDelete, isEditable = false }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // State for modal visibility

  return (
    <>
      <Card
        className="relative group cursor-pointer overflow-hidden border-0 bg-card-gradient transition-all duration-300 hover:scale-105 hover:shadow-card-hover w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Movie Poster */}
        <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
          <img
            src={movie.image}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://placehold.co/300x450/e50914/ffffff?text=${encodeURIComponent(movie.title)}`;
            }}
          />

          {/* Overlay on hover */}
          <div
            className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <Button
              size="sm"
              className="mr-1 sm:mr-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                if (movie.trailer_url) {
                  window.open(movie.trailer_url, "_blank");
                } else {
                  // In a real application, you'd use a custom modal or toast here
                  console.log("Trailer not available.");
                }
              }}
            >
              <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-0 sm:mr-1" />
              <span className="hidden sm:inline">Play</span>
            </Button>
            {/* New "More Info" button */}
            <Button
              size="sm"
              variant="secondary"
              className="text-xs"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click from propagating
                setIsDetailsModalOpen(true); // Open the details modal
              }}
            >
              <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-0 sm:mr-1" />
              <span className="hidden sm:inline">More Info</span>
            </Button>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-black/80 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md flex items-center">
            <Star className="w-2 h-2 sm:w-3 sm:h-3 text-yellow-400 mr-0.5 sm:mr-1 fill-current" />
            <span className="text-xs font-medium">{movie.rating}</span>
          </div>

          {/* Type Badge */}
          <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-primary px-1 sm:px-2 py-0.5 sm:py-1 rounded-md">
            <span className="text-xs font-medium uppercase">{movie.type}</span>
          </div>
        </div>

        {/* Movie Info */}
        <div className="p-2 sm:p-3">
          <h3 className="font-semibold text-xs sm:text-sm mb-1 line-clamp-1">{movie.title}</h3>
          <p className="text-muted-foreground text-xs mb-2">
            {movie.year} • {movie.genre}
          </p>

          {isHovered && (
            <div className="animate-slide-up">
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2 hidden sm:block">
                {movie.description}
              </p>
              {isEditable && onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(movie.id);
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Movie Details Modal */}
      <MovieDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        movie={movie}
      />
    </>
  );
}
