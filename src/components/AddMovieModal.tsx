import { useState, useRef } from "react";
import { Film, Tv, Upload, Plus } from "lucide-react";
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


const DEFAULT_GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Drama",
  "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"
];

export function AddMovieModal({
  isOpen,
  onClose,
  onAddMovie,
  onAddGenre
}: AddMovieModalProps) {
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
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
    if (!formData.title || !formData.genre) return;

    onAddMovie({
      ...formData,
      image:
        formData.image ||
        `https://via.placeholder.com/300x450/e50914/ffffff?text=${encodeURIComponent(formData.title)}`
    });

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
    onClose();
  };

  const handleAddGenre = (newGenre: string) => {
  if (!genres.includes(newGenre)) {
    setGenres((prev) => [...prev, newGenre]); // update dropdown
    onAddGenre(newGenre); // notify parent
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
              <Film className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
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

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter movie/series title"
                className="text-sm"
                required
              />
            </div>

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
