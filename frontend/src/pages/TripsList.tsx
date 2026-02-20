import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, MapPin, Calendar, DollarSign } from 'lucide-react';
import { fetchTrips } from '../api';
import { Button } from '../components/ui/Button';

export function TripsList() {
  const {
    data: trips,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['trips'],
    queryFn: fetchTrips,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" role="status">
        <Loader2 className="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading trips...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center space-y-4 py-12">
        <p className="text-error font-medium">Failed to load trips.</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  if (!trips || trips.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">No trips available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text">Available Trips</h2>
        <p className="mt-1 text-text-muted">Select a trip to register and pay.</p>
      </div>

      <div className="grid gap-4">
        {trips.map((trip) => {
          const formattedDate = new Date(trip.date).toLocaleDateString('en-NZ', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          return (
            <Link
              key={trip.id}
              to={`/trips/${trip.id}`}
              className="block bg-bg-card border border-border rounded-2xl shadow-sm p-6 hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <h3 className="text-lg font-bold text-text">{trip.name}</h3>
              {trip.description && (
                <p className="mt-1 text-sm text-text-muted line-clamp-2">{trip.description}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-text-muted">
                  <Calendar className="w-4 h-4 text-primary" aria-hidden="true" />
                  {formattedDate}
                </div>
                <div className="flex items-center gap-1.5 text-text-muted">
                  <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
                  {trip.location}
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-primary">
                  <DollarSign className="w-4 h-4" aria-hidden="true" />${trip.cost} NZD
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
