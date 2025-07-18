import * as React from "react";
import { Sparkles } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { tmdbApiKey } from "@/lib/supabaseClient"; // Import tmdbApiKey

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

interface RecommendationSectionProps {
  userMovies: Movie[]; // Movies already in the user's collection
  isEditable?: boolean;
  onDeleteMovie?: (id: string) => void;
}

export function RecommendationSection({ userMovies, isEditable, onDeleteMovie }: RecommendationSectionProps) {
  const [recommendations, setRecommendations] = React.useState<Movie[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      if (!tmdbApiKey) {
        setError("TMDB API Key is not configured. Please add VITE_TMDB_API_KEY to your .env file.");
        setLoading(false);
        return;
      }

      if (userMovies.length === 0) {
        setLoading(false);
        setRecommendations([]); // No user movies, so no personalized recommendations
        return;
      }

      try {
        let fetchedRecs: Movie[] = [];
        const seenTmdbIds = new Set<string>(); // To prevent duplicate recommendations

        // Sort user movies by rating (descending) to prioritize better recommendations
        const sortedUserMovies = [...userMovies].sort((a, b) => b.rating - a.rating);

        // Fetch similar content for a few (e.g., top 5) of the user's highly-rated movies/series
        const moviesToUseForRecommendations = sortedUserMovies.slice(0, 5);

        for (const userMovie of moviesToUseForRecommendations) {
          let tmdbSearchUrl = '';
          if (userMovie.type === 'movie') {
            // Search for the movie by title to get its TMDB ID
            const searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(userMovie.title)}&language=en-US`);
            const searchData = await searchRes.json();
            const tmdbMovieId = searchData.results?.[0]?.id;

            if (tmdbMovieId) {
              tmdbSearchUrl = `https://api.themoviedb.org/3/movie/${tmdbMovieId}/similar?api_key=${tmdbApiKey}&language=en-US&page=1`;
            }
          } else { // type === 'series'
            // Search for the TV series by title to get its TMDB ID
            const searchRes = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${tmdbApiKey}&query=${encodeURIComponent(userMovie.title)}&language=en-US`);
            const searchData = await searchRes.json();
            const tmdbTvId = searchData.results?.[0]?.id;

            if (tmdbTvId) {
              tmdbSearchUrl = `https://api.themoviedb.org/3/tv/${tmdbTvId}/similar?api_key=${tmdbApiKey}&language=en-US&page=1`;
            }
          }

          if (tmdbSearchUrl) {
            const response = await fetch(tmdbSearchUrl);
            if (!response.ok) {
              console.warn(`Failed to fetch similar content for "${userMovie.title}":`, response.statusText);
              continue; // Skip to next movie if this one fails
            }
            const data = await response.json();

            const mappedResults: Movie[] = (data.results || [])
              .filter((item: any) => item.poster_path && item.overview && item.vote_average > 0)
              .map((item: any) => ({
                id: String(item.id),
                title: item.title || item.name,
                // For genre, we can try to map TMDB genre_ids back to names
                genre: userMovie.genre, // Keep the genre of the source movie for simplicity, or map TMDB genre IDs to names if genre list is available globally
                year: item.release_date ? parseInt(item.release_date.substring(0, 4)) : (item.first_air_date ? parseInt(item.first_air_date.substring(0, 4)) : 0),
                rating: parseFloat(item.vote_average.toFixed(1)),
                image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                description: item.overview,
                type: item.media_type === 'tv' || item.first_air_date ? 'series' : 'movie', // Use first_air_date to infer TV type
                trailer_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.title || item.name)}+trailer`
              }));
            
            // Add to fetchedRecs, avoiding duplicates by TMDB ID
            for (const rec of mappedResults) {
                if (!seenTmdbIds.has(rec.id)) {
                    fetchedRecs.push(rec);
                    seenTmdbIds.add(rec.id);
                }
            }
          }
        }

        // Filter out movies already in the user's collection
        const finalRecommendations = fetchedRecs.filter(rec =>
          !userMovies.some(userMovie => userMovie.title === rec.title || userMovie.id === rec.id)
        );

        setRecommendations(finalRecommendations.slice(0, 15)); // Show up to 15 recommendations

      } catch (err: any) {
        console.error("Error fetching recommendations:", err);
        setError(`Failed to load recommendations: ${err.message}. Please check your browser's console for more details.`);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userMovies, tmdbApiKey]); // Re-fetch if userMovies or API key changes

  if (loading) {
    return (
      <div className="mb-8 sm:mb-12 animate-fade-in">
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
          <h2 className="text-xl sm:text-3xl font-bold text-foreground">Recommendations</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-full">
              <div className="aspect-[2/3] w-full bg-muted rounded-lg animate-pulse" />
              <div className="h-4 bg-muted rounded mt-2 w-3/4 animate-pulse" />
              <div className="h-3 bg-muted rounded mt-1 w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 sm:py-12 text-red-500">
        <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Error Loading Recommendations</h3>
        <p className="text-sm sm:text-base">{error}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Please ensure your TMDB API key is correct and you have an internet connection.
        </p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg sm:text-xl font-semibold mb-2">No New Recommendations</h3>
        <p className="text-sm sm:text-base text-muted-foreground">
          Add more movies and series to your collection to get personalized recommendations!
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8 sm:mb-12 animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
        <h2 className="text-xl sm:text-3xl font-bold text-foreground">Recommendations</h2>
      </div>

      {/* Recommendations Grid Container */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {recommendations.map((movie, index) => (
          <div
            key={movie.id}
            className="w-full animate-scale-in"
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
