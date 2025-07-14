import { Play, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/cinema-hero.jpg";

interface Movie {
  id: string;
  title: string;
  genre: string;
  year: number;
  rating: number;
  image: string;
  description: string;
  type: 'movie' | 'series';
  trailer_url?: string; // Make sure your Movie type has this field
}

interface HeroSectionProps {
  featuredMovie?: Movie;
}

export function HeroSection({ featuredMovie }: HeroSectionProps) {
  const defaultMovie: Movie = {
    id: "hero-1",
    title: "The Cinematic Experience",
    genre: "Adventure",
    year: 2024,
    rating: 9.2,
    image: heroImage,
    description:
      "Welcome to your personal movie dashboard. Add your favorite films and series, organize them by genre, and create your ultimate watchlist. Your cinema journey starts here.",
    type: "movie",
    trailer_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // fallback example trailer
  };

  const movie = featuredMovie || defaultMovie;

  const handlePlayClick = () => {
    if (movie.trailer_url) {
      window.open(movie.trailer_url, "_blank");
    } else {
      alert("Trailer not available.");
    }
  };

  return (
    <div className="relative h-[60vh] sm:h-[80vh] min-h-[400px] sm:min-h-[500px] overflow-hidden rounded-lg sm:rounded-2xl mb-4 sm:mb-8">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={movie.image}
          alt={movie.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&h=900&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-hero-gradient" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-end h-full p-4 sm:p-8 lg:p-12">
        <div className="max-w-2xl animate-fade-in">
          {/* Type and Rating */}
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <span className="bg-primary px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium uppercase">
              {movie.type}
            </span>
            <div className="flex items-center bg-black/50 px-2 sm:px-3 py-1 rounded-md">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 mr-1 fill-current" />
              <span className="text-xs sm:text-sm font-medium">{movie.rating}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 text-white drop-shadow-lg">
            {movie.title}
          </h1>

          {/* Year and Genre */}
          <p className="text-sm sm:text-lg lg:text-xl text-gray-200 mb-3 sm:mb-4">
            {movie.year} • {movie.genre}
          </p>

          {/* Description */}
          <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-4 sm:mb-8 max-w-lg leading-relaxed line-clamp-3 sm:line-clamp-none">
            {movie.description}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-4">
            <Button
              size="sm"
              onClick={handlePlayClick}
              className="bg-white text-black hover:bg-gray-200 px-4 sm:px-8 sm:size-lg"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 fill-current" />
              <span className="hidden sm:inline">Play Now</span>
              <span className="sm:hidden">Play</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-gray-600/80 text-white hover:bg-gray-600 border-0 px-4 sm:px-8 sm:size-lg"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">More Info</span>
              <span className="sm:hidden">Info</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
