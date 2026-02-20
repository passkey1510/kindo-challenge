import { MapPin, Calendar, DollarSign } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../utils/leafletSetup';
import type { Trip } from '../types';
import { Button } from './ui/Button';

interface TripDetailsProps {
  trip: Trip;
  onRegister: () => void;
}

export function TripDetails({ trip, onRegister }: TripDetailsProps) {
  const formattedDate = new Date(trip.date).toLocaleDateString('en-NZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hasCoordinates = trip.latitude != null && trip.longitude != null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text">{trip.name}</h2>
        {trip.description && (
          <p className="mt-2 text-text-muted leading-relaxed">{trip.description}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-start gap-3 p-4 bg-bg rounded-xl border border-border">
          <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-text-muted">Date</p>
            <p className="font-semibold">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-bg rounded-xl border border-border">
          <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-text-muted">Location</p>
            <p className="font-semibold">{trip.location}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-bg rounded-xl border border-border">
          <DollarSign className="w-5 h-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-text-muted">Cost</p>
            <p className="font-semibold text-lg">${trip.cost} NZD</p>
          </div>
        </div>
      </div>

      {hasCoordinates && (
        <div className="rounded-xl overflow-hidden border border-border h-56 sm:h-64">
          <MapContainer
            center={[trip.latitude!, trip.longitude!]}
            zoom={16}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[trip.latitude!, trip.longitude!]}>
              <Popup>{trip.location}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <p className="text-sm text-text-muted">
          <span className="font-medium text-text">School ID:</span> {trip.school_id}
          <span className="mx-2" aria-hidden="true">
            |
          </span>
          <span className="font-medium text-text">Activity:</span> {trip.activity_id}
        </p>
      </div>

      <Button onClick={onRegister} className="w-full">
        Register for this Trip
      </Button>
    </div>
  );
}
