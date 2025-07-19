import * as React from "react";
import { Calendar as CalendarIcon, Send } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface WatchTogetherModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: {
    id: string;
    title: string;
    image: string;
  };
  ownerUserId: string | null; // The ID of the user who owns the dashboard
}

export function WatchTogetherModal({ isOpen, onClose, movie, ownerUserId }: WatchTogetherModalProps) {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [requesterEmail, setRequesterEmail] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !requesterEmail || !ownerUserId) {
      toast({
        title: "Missing Information",
        description: "Please select a date, enter your email, and ensure the owner ID is available.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.from("watch_requests").insert([
        {
          movie_id: movie.id,
          movie_title: movie.title,
          movie_image: movie.image,
          requester_email: requesterEmail,
          scheduled_date: format(date, "yyyy-MM-dd"),
          owner_user_id: ownerUserId,
          status: "pending",
        },
      ]);

      if (error) {
        throw error;
      }

      toast({
        title: "Request Sent!",
        description: `Your watch request for "${movie.title}" on ${format(date, "PPP")} has been sent.`,
      });

      // --- Simulation of Email Sending ---
      console.log(`
        --- WATCH TOGETHER REQUEST SIMULATION ---
        To: Account Owner (User ID: ${ownerUserId})
        From: ${requesterEmail}
        Movie: ${movie.title}
        Scheduled Date: ${format(date, "PPP")}
        Status: Pending
        (In a real app, a Supabase Edge Function would trigger an email to the owner_user_id's registered email address with Accept/Decline links.)
        ---------------------------------------
      `);
      // --- End Simulation ---

      onClose();
      setDate(undefined);
      setRequesterEmail("");
    } catch (error: any) {
      console.error("Error sending watch request:", error);
      toast({
        title: "Failed to Send Request",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-gray-700">
        <DialogHeader>
          <DialogTitle>Schedule Watch Together</DialogTitle>
          <DialogDescription>
            Request to watch "{movie.title}" with the dashboard owner.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <img src={movie.image} alt={movie.title} className="w-16 h-24 object-cover rounded-md" />
            <h3 className="text-lg font-semibold">{movie.title}</h3>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="requester-email">Your Email</Label>
            <Input
              id="requester-email"
              type="email"
              placeholder="your.email@example.com"
              value={requesterEmail}
              onChange={(e) => setRequesterEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="watch-date">Proposed Watch Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-gray-700">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" className="w-full" disabled={isSending}>
            {isSending ? "Sending..." : <><Send className="w-4 h-4 mr-2" /> Send Request</>}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
