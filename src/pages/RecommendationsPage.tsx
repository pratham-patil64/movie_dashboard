import * as React from "react";
import { MovieDashboard } from "@/components/MovieDashboard"; // Assuming MovieDashboard provides context or common layout
import { RecommendationSection } from "@/components/RecommendationSection";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const RecommendationsPage = () => {
  const [userMovies, setUserMovies] = React.useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = React.useState(true);
  const [userId, setUserId] = React.useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch user ID
  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  // Fetch user's movies
  React.useEffect(() => {
    const fetchUserMovies = async () => {
      if (!userId) {
        setLoadingMovies(false);
        return;
      }

      setLoadingMovies(true);
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch user movies for recommendations:", error);
        toast({ title: "Error", description: "Failed to load your movies.", variant: "destructive" });
        setUserMovies([]);
      } else {
        setUserMovies(data);
      }
      setLoadingMovies(false);
    };

    fetchUserMovies();
  }, [userId, toast]);


  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Recommendations</h1>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/dashboard')} size="sm">
                <Home className="w-4 h-4 mr-2" /> Dashboard
            </Button>
            <LogoutButton />
        </div>
      </header>
      
      <main className="p-4 sm:p-6">
        {loadingMovies ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading your movies to generate recommendations...</p>
          </div>
        ) : (
          <RecommendationSection
            userMovies={userMovies}
            isEditable={false} // Recommendations are not editable in this view
          />
        )}
      </main>
    </div>
  );
};

export default RecommendationsPage;
