import type {
  Trip,
  RegistrationRequest,
  RegistrationResponse,
  PaymentRequest,
  PaymentResponse,
} from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({
      error: true,
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    }));
    throw data;
  }
  return response.json() as Promise<T>;
}

export async function fetchTrips(): Promise<Trip[]> {
  const response = await fetch(`${API_BASE}/api/v1/trips/`);
  return handleResponse<Trip[]>(response);
}

export async function fetchTrip(tripId: string): Promise<Trip> {
  const response = await fetch(`${API_BASE}/api/v1/trips/${tripId}/`);
  return handleResponse<Trip>(response);
}

export async function createRegistration(data: RegistrationRequest): Promise<RegistrationResponse> {
  const response = await fetch(`${API_BASE}/api/v1/registrations/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<RegistrationResponse>(response);
}

export async function submitPayment(data: PaymentRequest): Promise<PaymentResponse> {
  const response = await fetch(`${API_BASE}/api/v1/payments/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(20000),
  });
  return handleResponse<PaymentResponse>(response);
}

export async function fetchPaymentStatus(paymentId: number): Promise<PaymentResponse> {
  const response = await fetch(`${API_BASE}/api/v1/payments/${paymentId}/status/`);
  return handleResponse<PaymentResponse>(response);
}
