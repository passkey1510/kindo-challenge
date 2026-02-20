import { useParams } from 'react-router-dom';
import { Wizard } from '../components/Wizard';

export function TripPage() {
  const { id } = useParams<{ id: string }>();
  return <Wizard tripId={id!} />;
}
