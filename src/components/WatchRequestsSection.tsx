import * as React from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface WatchRequest {
  id: string;
  movie_id: string;
  movie_title: string;
  movie_image: string;
  requester_email: string;
  scheduled_date: string;
  owner_user_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

interface WatchRequestsSectionProps {
  ownerUserId: string; // The ID of the current logged-in user (the owner)
}

export function WatchRequestsSection({ ownerUserId }: WatchRequestsSectionProps) {
  const [requests, setRequests] = React.useState<WatchRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchRequests = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("watch_requests")
        .select("*")
        .eq("owner_user_id", ownerUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data);
    } catch (error: any) {
      console.error("Error fetching watch requests:", error);
      toast({
        title: "Error",
        description: `Failed to load watch requests: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [ownerUserId, toast]);

  React.useEffect(() => {
    fetchRequests();

    // Set up real-time listener for watch_requests table
    const subscription = supabase
      .channel('watch_requests_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'watch_requests', filter: `owner_user_id=eq.${ownerUserId}` }, payload => {
        console.log('Change received!', payload);
        fetchRequests(); // Re-fetch data on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchRequests, ownerUserId]);

  const handleStatusUpdate = async (requestId: string, newStatus: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from("watch_requests")
        .update({ status: newStatus })
        .eq("id", requestId)
        .eq("owner_user_id", ownerUserId); // Ensure only owner can update

      if (error) throw error;

      toast({
        title: "Request Updated",
        description: `Request has been ${newStatus}.`,
      });
      // fetchRequests(); // Realtime listener will handle re-fetching
    } catch (error: any) {
      console.error(`Error updating request to ${newStatus}:`, error);
      toast({
        title: "Update Failed",
        description: `Could not ${newStatus} the request: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">Loading watch requests...</div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">No watch requests received yet.</div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-100px)]"> {/* Adjust height as needed */}
      <div className="p-4 grid gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="bg-secondary border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">{request.movie_title}</CardTitle>
              {request.status === 'pending' && (
                <span className="text-sm text-yellow-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" /> Pending
                </span>
              )}
              {request.status === 'accepted' && (
                <span className="text-sm text-green-500 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Accepted
                </span>
              )}
              {request.status === 'declined' && (
                <span className="text-sm text-red-500 flex items-center">
                  <XCircle className="w-4 h-4 mr-1" /> Declined
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center">
                <img src={request.movie_image} alt={request.movie_title} className="w-20 h-30 object-cover rounded-md" onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://placehold.co/80x120/e50914/ffffff?text=${encodeURIComponent(request.movie_title)}`;
                }} />
                <div>
                  <CardDescription className="mb-1">From: {request.requester_email}</CardDescription>
                  <CardDescription className="mb-2">Date: {format(new Date(request.scheduled_date), "PPP")}</CardDescription>
                  {request.status === 'pending' && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => handleStatusUpdate(request.id, 'accepted')}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(request.id, 'declined')}>Decline</Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
