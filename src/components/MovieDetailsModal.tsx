import * as React from "react";
import { Play, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea for scrollable content

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

interface MovieDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie;
}

export function MovieDetailsModal({ isOpen, onClose, movie }: MovieDetailsModalProps) {
  // Handle play trailer functionality
  const handlePlayTrailer = () => {
    if (movie.trailer_url) {
      window.open(movie.trailer_url, "_blank");
    } else {
      // Use a custom message box instead of alert()
      // This would typically involve another modal or a toast notification
      console.log("Trailer not available.");
      // For now, we'll just log to console. In a full app, you'd show a user-friendly message.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl lg:max-w-4xl p-0 overflow-hidden bg-card border-gray-700 shadow-netflix rounded-xl">
        <ScrollArea className="max-h-[90vh]"> {/* Make content scrollable */}
          <div className="relative">
            {/* Movie Poster/Background with Gradient Overlay */}
            <div className="relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden">
              <img
                src={movie.image}
                alt={movie.title}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://placehold.co/1200x600/e50914/ffffff?text=${encodeURIComponent(movie.title)}`;
                }}
              />
              {/* Dark gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80" />
              {/* Content on top of the image */}
              <div className="absolute bottom-0 left-0 p-4 sm:p-6 lg:p-8 text-white w-full">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 drop-shadow-lg">
                  {movie.title}
                </h2>
                <div className="flex items-center gap-3 text-sm sm:text-base text-gray-300">
                  <span>{movie.year}</span>
                  <span className="px-2 py-0.5 bg-primary rounded-md text-xs uppercase font-medium">
                    {movie.type}
                  </span>
                  <span className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                    {movie.rating}
                  </span>
                  <span>{movie.genre}</span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Details Content */}
          <div className="p-4 sm:p-6 lg:p-8 bg-card text-card-foreground">
            <p className="text-sm sm:text-base leading-relaxed mb-6">
              {movie.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {movie.trailer_url && (
                <Button
                  onClick={handlePlayTrailer}
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                >
                  <Play className="w-4 h-4 mr-2" /> Play Trailer
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto border-gray-600 text-muted-foreground hover:bg-gray-700 hover:text-white transition-all duration-300"
              >
                Close
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
