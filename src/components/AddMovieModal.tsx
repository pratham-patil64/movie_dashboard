import { useState, useRef, useEffect, useCallback } from "react";
import { Film, Tv, Upload, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { AddGenreModal } from "./AddGenreModal";
import { tmdbApiKey } from "@/lib/supabaseClient"; // Import tmdbApiKey
import { useToast } from "@/hooks/use-toast"; // Import useToast for notifications

interface Movie {
  id: string;
  title: string;
  genre: string;
  year: number;
  rating: number;
  image: string;
  description: string;
  trailer_url?: string;
  type: "movie" | "series";
}

interface AddMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMovie: (movie: Omit<Movie, "id">) => void;
  existingGenres: string[];
  onAddGenre: (genre: string) => void;
}

// Default genres for the dropdown
const DEFAULT_GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Drama",
  "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"
];

// Interface for TMDB search results
interface TmdbSearchResult {
  id: number;
  title?: string;
  name?: string; // For TV series
  release_date?: string; // For movies
  first_air_date?: string; // For TV series
  poster_path?: string;
  overview?: string;
  vote_average?: number;
  media_type: 'movie' | 'tv';
}

export function AddMovieModal({
  isOpen,
  onClose,
  onAddMovie,
  existingGenres, // Use existingGenres from props
  onAddGenre: parentOnAddGenre // Renamed to avoid conflict with local function
}: AddMovieModalProps) {
  const { toast } = useToast();
  const [genres, setGenres] = useState<string[]>(DEFAULT_GENRES);
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    year: new Date().getFullYear(),
    rating: 8.0,
    image: "",
    description: "",
    trailer_url: "",
    type: "movie" as "movie" | "series"
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isAddGenreModalOpen, setIsAddGenreModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for TMDB search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TmdbSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Merge existing genres from props with default genres
  useEffect(() => {
    // Corrected: Use existingGenres prop, not the onAddGenre function
    const combinedGenres = Array.from(new Set([...DEFAULT_GENRES, ...existingGenres]));
    setGenres(combinedGenres);
  }, [existingGenres]); // Depend on existingGenres


  // Debounce search input
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSearchResults(true); // Always show results when typing

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (query.length > 2) {
        performTmdbSearch(query);
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 500); // Debounce for 500ms
  };

  // Perform TMDB search
  const performTmdbSearch = useCallback(async (query: string) => {
    if (!tmdbApiKey) {
      toast({ title: "Error", description: "TMDB API Key is not configured.", variant: "destructive" });
      return;
    }
    setIsSearching(true);
    try {
      const url = `https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSearchResults(data.results.filter((item: any) => 
        (item.media_type === 'movie' || item.media_type === 'tv') && 
        (item.poster_path || item.backdrop_path)
      ));
    } catch (error) {
      console.error("Error fetching from TMDB:", error);
      toast({ title: "Error", description: "Failed to fetch search results from TMDB.", variant: "destructive" });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [toast, tmdbApiKey]);

  // Handle selection from TMDB search results
  const handleSelectTmdbResult = async (result: TmdbSearchResult) => {
    setSearchQuery(result.title || result.name || "");
    setShowSearchResults(false); // Hide results after selection
    
    const type = result.media_type === 'tv' ? 'series' : 'movie';
    const title = result.title || result.name || "";
    const year = result.release_date 
      ? parseInt(result.release_date.substring(0, 4)) 
      : (result.first_air_date ? parseInt(result.first_air_date.substring(0, 4)) : new Date().getFullYear());
    const rating = result.vote_average ? parseFloat(result.vote_average.toFixed(1)) : 8.0;
    const image = result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : "";
    const description = result.overview || "";

    // Attempt to find a trailer URL from TMDB
    let trailerUrl = "";
    if (tmdbApiKey) {
      try {
        const videosUrl = `https://api.themoviedb.org/3/${result.media_type}/${result.id}/videos?api_key=${tmdbApiKey}&language=en-US`;
        const videoRes = await fetch(videosUrl);
        const videoData = await videoRes.json();
        const youtubeTrailer = videoData.results?.find((vid: any) => vid.site === "YouTube" && vid.type === "Trailer");
        if (youtubeTrailer) {
          trailerUrl = `https://www.youtube.com/watch?v=${youtubeTrailer.key}`;
        }
      } catch (videoError) {
        console.warn("Could not fetch trailer:", videoError);
      }
    }

    setFormData({
      title,
      genre: formData.genre, // Keep current genre, user can change
      year,
      rating,
      image,
      description,
      trailer_url: trailerUrl,
      type
    });
    setImagePreview(image); // Set image preview if an image is available
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "File size must be less than 5MB.", variant: "destructive" });
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.genre) {
      toast({ title: "Error", description: "Title and Genre are required.", variant: "destructive" });
      return;
    }

    onAddMovie({
      ...formData,
      image:
        formData.image ||
        `https://placehold.co/300x450/e50914/ffffff?text=${encodeURIComponent(formData.title)}`
    });

    // Reset form
    setFormData({
      title: "",
      genre: "",
      year: new Date().getFullYear(),
      rating: 8.0,
      image: "",
      description: "",
      trailer_url: "",
      type: "movie"
    });
    setImageFile(null);
    setImagePreview("");
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    onClose();
  };

  const handleAddGenre = (newGenre: string) => {
    if (!genres.includes(newGenre)) {
      setGenres((prev) => [...prev, newGenre]); // update dropdown
      parentOnAddGenre(newGenre); // notify parent
    }
    setFormData((prev) => ({ ...prev, genre: newGenre }));
    setIsAddGenreModalOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg bg-card border-gray-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              {formData.type === "movie" ? (
                <Film className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              ) : (
                <Tv className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              )}
              Add New {formData.type === "movie" ? "Movie" : "Series"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.type === "movie" ? "default" : "outline"}
                className="flex-1 text-xs sm:text-sm"
                size="sm"
                onClick={() => setFormData({ ...formData, type: "movie" })}
              >
                Movie
              </Button>
              <Button
                type="button"
                variant={formData.type === "series" ? "default" : "outline"}
                className="flex-1 text-xs sm:text-sm"
                size="sm"
                onClick={() => setFormData({ ...formData, type: "series" })}
              >
                Series
              </Button>
            </div>

            {/* Title Search */}
            <div className="relative">
              <Label htmlFor="title" className="text-sm">Title *</Label>
              <div className="relative">
                <Input
                  id="title"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 100)} // Delay hiding to allow click
                  placeholder="Search for a movie or series..."
                  className="text-sm pr-10"
                  required
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              {isSearching && searchQuery.length > 2 && (
                <div className="absolute z-10 w-full bg-card border border-input rounded-md shadow-lg mt-1 p-2">
                  <p className="text-sm text-muted-foreground">Searching...</p>
                </div>
              )}
              {showSearchResults && searchResults.length > 0 && !isSearching && (
                <div className="absolute z-10 w-full bg-card border border-input rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center gap-3 p-2 hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleSelectTmdbResult(result)}
                    >
                      {result.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                          alt={result.title || result.name}
                          className="w-10 h-15 object-cover rounded-sm flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-15 bg-muted-foreground/20 rounded-sm flex-shrink-0 flex items-center justify-center text-xs text-muted-foreground">
                          No Img
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-1">
                          {result.title || result.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {result.release_date ? result.release_date.substring(0, 4) : (result.first_air_date ? result.first_air_date.substring(0, 4) : 'N/A')} ({result.media_type === 'movie' ? 'Movie' : 'Series'})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showSearchResults && searchQuery.length > 2 && !isSearching && searchResults.length === 0 && (
                <div className="absolute z-10 w-full bg-card border border-input rounded-md shadow-lg mt-1 p-2">
                  <p className="text-sm text-muted-foreground">No results found. Try a different query or enter details manually.</p>
                </div>
              )}
            </div>

            {/* Manual Title (if not using search or to override) */}
            {searchQuery.length > 0 && !showSearchResults && (
              <div>
                <Label htmlFor="manual-title" className="text-sm">Manual Title (Override)</Label>
                <Input
                  id="manual-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter title manually"
                  className="text-sm"
                />
              </div>
            )}


            {/* Poster Upload */}
            <div>
              <Label className="text-sm">Poster Image</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-36 sm:w-32 sm:h-48 object-cover rounded-lg mx-auto"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="mt-2 w-full text-xs"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-600 rounded-lg p-4 sm:p-6 text-center cursor-pointer hover:border-gray-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      Click to upload poster image
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Genre + Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Genre *</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.genre}
                    onValueChange={(value) =>
                      setFormData({ ...formData, genre: value })
                    }
                  >
                    <SelectTrigger className="text-sm flex-1">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddGenreModalOpen(true)}
                    className="px-2"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="year" className="text-sm">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year: parseInt(e.target.value)
                    })
                  }
                  min="1900"
                  max={new Date().getFullYear() + 5}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <Label htmlFor="rating" className="text-sm">Rating (1-10)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rating: parseFloat(e.target.value)
                  })
                }
                className="text-sm"
              />
            </div>

            {/* Trailer URL */}
            <div>
              <Label htmlFor="trailer_url" className="text-sm">
                Trailer YouTube Link
              </Label>
              <Input
                id="trailer_url"
                type="url"
                value={formData.trailer_url}
                onChange={(e) =>
                  setFormData({ ...formData, trailer_url: e.target.value })
                }
                placeholder="https://youtube.com/watch?v=..."
                className="text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description..."
                rows={3}
                className="text-sm resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 text-sm"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 text-sm">
                Add {formData.type === "movie" ? "Movie" : "Series"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AddGenreModal
        isOpen={isAddGenreModalOpen}
        onClose={() => setIsAddGenreModalOpen(false)}
        onAddGenre={handleAddGenre}
        existingGenres={genres}
      />
    </>
  );
}
