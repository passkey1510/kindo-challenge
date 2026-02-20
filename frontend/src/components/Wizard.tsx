import { useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { fetchTrip } from '../api';
import { useWizardState } from '../hooks/useWizardState';
import { ProgressBar } from './ProgressBar';
import { TripDetails } from './TripDetails';
import { RegistrationForm } from './RegistrationForm';
import { PaymentForm } from './PaymentForm';
import { Confirmation } from './Confirmation';
import { Button } from './ui/Button';

interface WizardProps {
  tripId: string;
}

export function Wizard({ tripId }: WizardProps) {
  const stepRef = useRef<HTMLDivElement>(null);

  const tripQuery = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => fetchTrip(tripId),
  });

  const wizard = useWizardState({ trip: tripQuery.data });

  // Focus management: move focus to step container on step change
  useEffect(() => {
    if (stepRef.current) {
      stepRef.current.focus();
    }
  }, [wizard.step]);

  if (tripQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" role="status">
        <Loader2 className="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading trip details...</span>
      </div>
    );
  }

  if (tripQuery.isError) {
    return (
      <div className="text-center space-y-4 py-12">
        <p className="text-error font-medium">Failed to load trip details.</p>
        <Button onClick={() => tripQuery.refetch()}>Try Again</Button>
      </div>
    );
  }

  const trip = tripQuery.data;
  if (!trip) return null;

  return (
    <div>
      <ProgressBar currentStep={wizard.step} />

      <div
        ref={stepRef}
        tabIndex={-1}
        className="bg-bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8 focus:outline-none"
      >
        {wizard.step === 'trip' && <TripDetails trip={trip} onRegister={wizard.goToRegistration} />}

        {wizard.step === 'registration' && (
          <RegistrationForm
            onSubmit={wizard.handleRegistrationSubmit}
            onBack={wizard.goToTrip}
            isLoading={wizard.isRegistering}
            error={wizard.error}
          />
        )}

        {wizard.step === 'payment' && (
          <PaymentForm
            amount={trip.cost}
            onSubmit={wizard.handlePaymentSubmit}
            onBack={wizard.goToRegistration}
            isLoading={wizard.isPaying}
            error={wizard.error}
          />
        )}

        {wizard.step === 'confirmation' && (
          <Confirmation
            payment={wizard.payment}
            error={wizard.error}
            onRetry={wizard.handleRetry}
            onStartOver={wizard.handleStartOver}
          />
        )}
      </div>
    </div>
  );
}
