import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createRegistration, submitPayment } from '../api';
import type {
  WizardStep,
  RegistrationResponse,
  PaymentResponse,
  ApiError,
  RegistrationFormData,
  PaymentFormData,
  Trip,
} from '../types';
import { stripCardSpaces } from '../utils/cardFormatting';

interface UseWizardStateOptions {
  trip: Trip | undefined;
}

export function useWizardState({ trip }: UseWizardStateOptions) {
  const [step, setStep] = useState<WizardStep>('trip');
  const [registration, setRegistration] = useState<RegistrationResponse | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const registrationMutation = useMutation({
    mutationFn: createRegistration,
    onSuccess: (data) => {
      setRegistration(data);
      setError(null);
      setStep('payment');
    },
    onError: (err: ApiError) => {
      setError(err.message || 'Registration failed. Please try again.');
    },
  });

  const paymentMutation = useMutation({
    mutationFn: submitPayment,
    onSuccess: (data) => {
      setPayment(data);
      setError(null);
      setStep('confirmation');
    },
    onError: (err: ApiError) => {
      setError(err.message || 'Payment failed. Please try again.');
      setPayment(null);
      setStep('confirmation');
    },
  });

  const goToRegistration = useCallback(() => {
    setError(null);
    setStep('registration');
  }, []);

  const goToTrip = useCallback(() => {
    setError(null);
    setStep('trip');
  }, []);

  const goToPayment = useCallback(() => {
    setError(null);
    setStep('payment');
  }, []);

  const handleRegistrationSubmit = useCallback(
    (data: RegistrationFormData) => {
      if (!trip) return;
      setError(null);
      registrationMutation.mutate({ ...data, trip: trip.id });
    },
    [trip, registrationMutation],
  );

  const handlePaymentSubmit = useCallback(
    (data: PaymentFormData) => {
      if (!registration) return;
      setError(null);
      paymentMutation.mutate({
        registration_id: registration.id,
        card_number: stripCardSpaces(data.card_number),
        expiry_date: data.expiry_date,
        cvv: data.cvv,
      });
    },
    [registration, paymentMutation],
  );

  const handleRetry = useCallback(() => {
    setError(null);
    setPayment(null);
    setStep('payment');
  }, []);

  const handleStartOver = useCallback(() => {
    setStep('trip');
    setRegistration(null);
    setPayment(null);
    setError(null);
  }, []);

  return {
    step,
    registration,
    payment,
    error,
    isRegistering: registrationMutation.isPending,
    isPaying: paymentMutation.isPending,
    goToRegistration,
    goToTrip,
    goToPayment,
    handleRegistrationSubmit,
    handlePaymentSubmit,
    handleRetry,
    handleStartOver,
  };
}
