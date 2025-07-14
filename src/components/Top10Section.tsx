import { Trophy, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Movie {
  id: string;
  title: string;
  genre: string;
  year: number;
  rating: number;
  image: string;
  description: string;
  type: 'movie' | 'series';
  trailer_url?: string; // ✅ Add this field
}

interface Top10SectionProps {
  movies: Movie[];
  series: Movie[];
  onDeleteMovie?: (id: string) => void;
  isEditable?: boolean;
}

function Top10Item({
  movie,
  rank,
  onDelete,
  isEditable
}: {
  movie: Movie;
  rank: number;
  onDelete?: (id: string) => void;
  isEditable?: boolean;
}) {
  const handlePlay = () => {
    if (movie.trailer_url) {
      window.open(movie.trailer_url, "_blank");
    } else {
      alert("Trailer not available.");
    }
  };

  return (
    <Card className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-card-gradient border-0 hover:bg-secondary/50 transition-colors group">
      {/* Rank */}
      <div className="text-2xl sm:text-4xl font-bold text-primary flex-shrink-0 w-8 sm:w-12">
        {rank}
      </div>

      {/* Poster */}
      <div className="w-12 h-18 sm:w-16 sm:h-24 rounded-md overflow-hidden flex-shrink-0">
        <img
          src={movie.image}
          alt={movie.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/64x96/e50914/ffffff?text=${rank}`;
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 sm:gap-2 mb-1">
          <h3 className="font-semibold text-sm sm:text-base truncate">{movie.title}</h3>
          <span className="bg-primary px-1 sm:px-2 py-0.5 rounded text-xs uppercase flex-shrink-0">
            {movie.type}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-1">
          {movie.year} • {movie.genre}
        </p>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span className="text-xs sm:text-sm">{movie.rating}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <Button
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs sm:text-sm"
          onClick={handlePlay}
        >
          <Play className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline ml-1">Play</span>
        </Button>
        {isEditable && onDelete && (
          <Button
            size="sm"
            variant="destructive"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs sm:text-sm"
            onClick={() => onDelete(movie.id)}
          >
            <span className="hidden sm:inline">Remove</span>
            <span className="sm:hidden">×</span>
          </Button>
        )}
      </div>
    </Card>
  );
}

export function Top10Section({
  movies,
  series,
  onDeleteMovie,
  isEditable = false
}: Top10SectionProps) {
  const top10Movies = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 10);
  const top10Series = [...series].sort((a, b) => b.rating - a.rating).slice(0, 10);

  return (
    <div className="mb-8 sm:mb-12 animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
        <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        <h2 className="text-xl sm:text-3xl font-bold text-foreground">Top 10</h2>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        {/* Top 10 Movies */}
        {top10Movies.length > 0 && (
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">Movies</h3>
            <div className="space-y-2 sm:space-y-3">
              {top10Movies.map((movie, index) => (
                <div
                  key={movie.id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Top10Item
                    movie={movie}
                    rank={index + 1}
                    onDelete={onDeleteMovie}
                    isEditable={isEditable}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top 10 Series */}
        {top10Series.length > 0 && (
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">Series</h3>
            <div className="space-y-2 sm:space-y-3">
              {top10Series.map((series, index) => (
                <div
                  key={series.id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Top10Item
                    movie={series}
                    rank={index + 1}
                    onDelete={onDeleteMovie}
                    isEditable={isEditable}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {top10Movies.length === 0 && top10Series.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold mb-2">No Top Rated Content Yet</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Add some movies and series to see your top-rated content here!
          </p>
        </div>
      )}
    </div>
  );
}
