import { useState, useEffect } from "react";
import { Plus, Eye, EyeOff, Share2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { HeroSection } from "./HeroSection";
import { CategoryRow } from "./CategoryRow";
import { Top10Section } from "./Top10Section";
import { AddMovieModal } from "./AddMovieModal";
import { supabase } from "@/lib/supabaseClient";
import LogoutButton from "./LogoutButton";

interface Movie {
  id: string;
  user_id: string;
  title: string;
  genre: string;
  year: number;
  rating: number;
  image: string;
  description: string;
  trailer_url: string;
  type: "movie" | "series";
  created_at?: string;
}

export function MovieDashboard() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

  // Fetch user and view/edit mode
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const urlParams = new URLSearchParams(window.location.search);
      const viewOnly = urlParams.get("view") === "only";
      const sharedUser = urlParams.get("user");

      if (viewOnly && sharedUser) {
        setUserId(sharedUser);
        setIsViewOnly(true);
        setIsEditMode(false); // Disable editing in shared view
      } else {
        setUserId(user?.id || null);
        setIsEditMode(!!user);
        setIsViewOnly(false);
      }
    };

    fetchUser();
  }, []);

  // Fetch movies for the current user or shared user
  const fetchMovies = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch:", error);
    } else {
      setMovies(data);
      const uniqueGenres = Array.from(new Set(data.map((m) => m.genre)));
      setGenres(uniqueGenres);
    }
  };

  useEffect(() => {
    if (userId) fetchMovies();
  }, [userId]);

  // Add new movie
  const addMovie = async (movieData: Omit<Movie, "id" | "user_id">) => {
    if (!userId) return;

    const { error } = await supabase.from("movies").insert([
      { ...movieData, user_id: userId },
    ]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Added!", description: `${movieData.title} was added.` });
      fetchMovies();
    }
  };

  // Delete movie
  const deleteMovie = async (id: string) => {
    const movie = movies.find((m) => m.id === id);
    const { error } = await supabase.from("movies").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: `${movie?.title || "Movie"} deleted.` });
      fetchMovies();
    }
  };

  // Share collection link
  const shareCollection = () => {
    const shareUrl = `${window.location.origin}/dashboard?view=only&user=${userId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied!",
      description: "Your public dashboard link was copied to clipboard.",
    });
  };

  const moviesByGenre = movies.reduce((acc, movie) => {
    if (!acc[movie.genre]) acc[movie.genre] = [];
    acc[movie.genre].push(movie);
    return acc;
  }, {} as Record<string, Movie[]>);

  const moviesList = movies.filter((m) => m.type === "movie");
  const seriesList = movies.filter((m) => m.type === "series");

  const featuredMovie = movies.length > 0
    ? movies.reduce((prev, current) => (prev.rating > current.rating ? prev : current))
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-b border-gray-800 gap-4">
        {/* Updated Title Section */}
        <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary mb-2 text-center sm:text-left animate-fade-in animate-glow">
            WatchTime
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base text-center sm:text-left">
            Your personal movie & series collection
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-end">
          {/* Toggle Edit/View Mode */}
          {!isViewOnly && (
            <Button variant="outline" onClick={() => setIsEditMode(!isEditMode)} size="sm">
              {isEditMode ? (
                <>
                  <Eye className="w-4 h-4" /> View Mode
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" /> Edit Mode
                </>
              )}
            </Button>
          )}

          {/* Share + Logout */}
          {userId && (
            <>
              <Button variant="outline" onClick={shareCollection} size="sm">
                <Share2 className="w-4 h-4" /> Share
              </Button>
              {!isViewOnly && isEditMode && <LogoutButton />}
            </>
          )}

          {/* Add Button */}
          {isEditMode && userId && (
            <Button onClick={() => setIsAddModalOpen(true)} size="sm">
              <Plus className="w-4 h-4" /> Add
            </Button>
          )}
        </div>
      </header>

      <main className="p-4 sm:p-6">
        {featuredMovie && <HeroSection featuredMovie={featuredMovie} />}

        <Top10Section
          movies={moviesList}
          series={seriesList}
          onDeleteMovie={isEditMode ? deleteMovie : undefined}
          isEditable={isEditMode}
        />

        {Object.entries(moviesByGenre).map(([genre, list]) => (
          <CategoryRow
            key={genre}
            title={genre}
            movies={list}
            onDeleteMovie={isEditMode ? deleteMovie : undefined}
            isEditable={isEditMode}
          />
        ))}

        {movies.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-2xl font-bold mb-4">Welcome to Your Cinema</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start building your personal movie and series collection.
            </p>
            {isEditMode && (
              <Button onClick={() => setIsAddModalOpen(true)} size="lg">
                <Plus className="w-5 h-5" /> Add Your First Movie
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      <AddMovieModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMovie={addMovie}
        existingGenres={genres}
        onAddGenre={() => {}}
      />
    </div>
  );
}
