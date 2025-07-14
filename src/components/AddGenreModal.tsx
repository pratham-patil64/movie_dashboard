import { useState } from "react";
import { Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddGenreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGenre: (genre: string) => void;
  existingGenres: string[];
}

export function AddGenreModal({
  isOpen,
  onClose,
  onAddGenre,
  existingGenres
}: AddGenreModalProps) {
  const [genreName, setGenreName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedGenre = genreName.trim();

    if (!trimmedGenre) return;

    // Avoid duplicates (case-insensitive)
    const exists = existingGenres.some(
      (g) => g.toLowerCase() === trimmedGenre.toLowerCase()
    );
    if (exists) {
      alert(`Genre "${trimmedGenre}" already exists.`);
      return;
    }

    onAddGenre(trimmedGenre);
    setGenreName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Tag className="w-5 h-5 text-primary" />
            Add New Genre
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="genre-name">Genre Name *</Label>
            <Input
              id="genre-name"
              value={genreName}
              onChange={(e) => setGenreName(e.target.value)}
              placeholder="e.g., Horror, Comedy, Sci-Fi"
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Genre
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
