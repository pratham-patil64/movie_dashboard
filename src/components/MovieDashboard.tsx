import { useState, useEffect } from "react";
import { Plus, Eye, Share2, Edit3, Sparkles, Users } from "lucide-react"; // Import Users for Watch Requests button
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { HeroSection } from "./HeroSection";
import { CategoryRow } from "./CategoryRow";
import { Top10Section } from "./Top10Section";
import { AddMovieModal } from "./AddMovieModal";
import { supabase } from "@/lib/supabaseClient";
import LogoutButton from "./LogoutButton";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"; // Import Sheet components
import { WatchRequestsSection } from "./WatchRequestsSection"; // Import WatchRequestsSection

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
  const navigate = useNavigate();

  // Fetch user and view/edit mode
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const urlParams = new URLSearchParams(window.location.search);
      const viewOnly = urlParams.get("view") === "only";
      const sharedUser = urlParams.get("user"); // This is the owner's user ID from the URL

      if (viewOnly && sharedUser) {
        setUserId(sharedUser); // In view-only, userId is the owner's ID
        setIsViewOnly(true);
        setIsEditMode(false); // Disable editing in shared view
      } else {
        setUserId(user?.id || null); // Otherwise, userId is the logged-in user's ID
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
  const shareCollection = async () => { // Made async to await getUser()
    const { data: { user } } = await supabase.auth.getUser(); // Get current logged-in user
    const currentOwnerId = new URLSearchParams(window.location.search).get("user") || user?.id; // Corrected: Use user?.id

    if (!currentOwnerId) {
      toast({title: "Error", description: "Could not determine owner ID for sharing.", variant: "destructive"});
      return;
    }

    const shareUrl = `${window.location.origin}/dashboard?view=only&user=${currentOwnerId}`;
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

  // Determine the ownerUserId to pass to MovieCard/MovieDetailsModal
  // If in view-only mode, the owner is the 'user' from the URL.
  // If in edit mode, the owner is the currently logged-in user.
  const currentDashboardOwnerId = isViewOnly ? new URLSearchParams(window.location.search).get("user") : userId;


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

        {/* Professional Button Group */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-end">
          {/* Toggle Edit/View Mode */}
          {!isViewOnly && (
            <Button
              variant="outline"
              onClick={() => setIsEditMode(!isEditMode)}
              size="sm"
              className="rounded-full px-4 py-2 text-sm transition-all duration-200 hover:scale-105"
            >
              {isEditMode ? (
                <>
                  <Eye className="w-4 h-4 mr-1" /> View Mode
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-1" /> Edit Mode
                </>
              )}
            </Button>
          )}

          {/* Recommendations Button */}
          {!isViewOnly && (
            <Button
              variant="outline"
              onClick={() => navigate('/recommendations')}
              size="sm"
              className="rounded-full px-4 py-2 text-sm transition-all duration-200 hover:scale-105"
            >
              <Sparkles className="w-4 h-4 mr-1" /> Recommendations
            </Button>
          )}

          {/* Share Button */}
          {userId && ( // Only show share button if a user is logged in (i.e., not a totally anonymous view)
            <Button
              variant="outline"
              onClick={shareCollection}
              size="sm"
              className="rounded-full px-4 py-2 text-sm transition-all duration-200 hover:scale-105"
            >
              <Share2 className="w-4 h-4 mr-1" /> Share
            </Button>
          )}

          {/* Watch Requests Button (only for logged-in users who own the dashboard) */}
          {userId && !isViewOnly && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 py-2 text-sm transition-all duration-200 hover:scale-105"
                >
                  <Users className="w-4 h-4 mr-1" /> Requests
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[450px] bg-card border-gray-700">
                <SheetHeader>
                  <SheetTitle className="text-xl">Incoming Watch Requests</SheetTitle>
                </SheetHeader>
                {userId && <WatchRequestsSection ownerUserId={userId} />}
              </SheetContent>
            </Sheet>
          )}

          {/* Add Button */}
          {isEditMode && userId && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              size="sm"
              className="rounded-full px-4 py-2 text-sm transition-all duration-200 hover:scale-105 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          )}

          {/* Logout Button (moved to last) */}
          {userId && !isViewOnly && isEditMode && (
            <LogoutButton className="rounded-full px-4 py-2 text-sm transition-all duration-200 hover:scale-105" />
          )}
        </div>
      </header>

      <main className="p-4 sm:p-6">
        {featuredMovie && <HeroSection featuredMovie={featuredMovie} ownerUserId={currentDashboardOwnerId} />}

        <Top10Section
          movies={moviesList}
          series={seriesList}
          onDeleteMovie={isEditMode ? deleteMovie : undefined}
          isEditable={isEditMode}
          ownerUserId={currentDashboardOwnerId} // Pass ownerUserId
        />

        {Object.entries(moviesByGenre).map(([genre, list]) => (
          <CategoryRow
            key={genre}
            title={genre}
            movies={list}
            onDeleteMovie={isEditMode ? deleteMovie : undefined}
            isEditable={isEditMode}
            ownerUserId={currentDashboardOwnerId} // Pass ownerUserId
          />
        ))}

        {movies.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-2xl font-bold mb-4">Welcome to WatchTime</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start building your personal movie and series collection.
            </p>
            {isEditMode && (
              <Button onClick={() => setIsAddModalOpen(true)} size="lg">
                <Plus className="w-5 h-5 mr-2" /> Add Your First Movie
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
