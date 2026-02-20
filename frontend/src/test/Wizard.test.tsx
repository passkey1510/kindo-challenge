import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Wizard } from '../components/Wizard';
import * as api from '../api';

vi.mock('../api');

const mockTrip = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Auckland Museum Field Trip',
  date: '2026-03-15',
  location: 'Auckland Museum, Auckland',
  cost: '25.00',
  description: 'A fun educational trip to the Auckland Museum.',
  school_id: 'SCH-001',
  activity_id: 'ACT-FIELD-001',
};

const mockRegistration = {
  id: 1,
  student_name: 'Emma Wilson',
  parent_name: 'Sarah Wilson',
  parent_email: 'sarah@example.com',
  trip: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  created_at: '2026-02-20T10:00:00Z',
};

const mockPayment = {
  id: 1,
  registration: 1,
  amount: '25.00',
  card_last_four: '5678',
  status: 'success' as const,
  transaction_id: 'TXN-12345',
  error_message: '',
  attempts: 1,
  created_at: '2026-02-20T10:01:00Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('Wizard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading state while fetching trip', () => {
    vi.mocked(api.fetchTrip).mockReturnValue(new Promise(() => {}));
    render(<Wizard tripId="a1b2c3d4-e5f6-7890-abcd-ef1234567890" />, { wrapper: createWrapper() });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays trip details after loading', async () => {
    vi.mocked(api.fetchTrip).mockResolvedValue(mockTrip);
    render(<Wizard tripId="a1b2c3d4-e5f6-7890-abcd-ef1234567890" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Auckland Museum Field Trip')).toBeInTheDocument();
    });
    expect(screen.getByText('Auckland Museum, Auckland')).toBeInTheDocument();
    expect(screen.getByText('$25.00 NZD')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register for this trip/i })).toBeInTheDocument();
  });

  it('shows error state when trip fetch fails', async () => {
    vi.mocked(api.fetchTrip).mockRejectedValue(new Error('Network error'));
    render(<Wizard tripId="a1b2c3d4-e5f6-7890-abcd-ef1234567890" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/failed to load trip details/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('navigates to registration form when register is clicked', async () => {
    vi.mocked(api.fetchTrip).mockResolvedValue(mockTrip);
    const user = userEvent.setup();
    render(<Wizard tripId="a1b2c3d4-e5f6-7890-abcd-ef1234567890" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Auckland Museum Field Trip')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /register for this trip/i }));

    expect(screen.getByText('Register Your Child')).toBeInTheDocument();
    expect(screen.getByLabelText(/student name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/parent \/ guardian name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/parent \/ guardian email/i)).toBeInTheDocument();
  });

  it('goes back to trip details from registration', async () => {
    vi.mocked(api.fetchTrip).mockResolvedValue(mockTrip);
    const user = userEvent.setup();
    render(<Wizard tripId="a1b2c3d4-e5f6-7890-abcd-ef1234567890" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Auckland Museum Field Trip')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /register for this trip/i }));
    expect(screen.getByText('Register Your Child')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText('Auckland Museum Field Trip')).toBeInTheDocument();
  });

  it('navigates full wizard flow to confirmation', async () => {
    vi.mocked(api.fetchTrip).mockResolvedValue(mockTrip);
    vi.mocked(api.createRegistration).mockResolvedValue(mockRegistration);
    vi.mocked(api.submitPayment).mockResolvedValue(mockPayment);
    const user = userEvent.setup();
    render(<Wizard tripId="a1b2c3d4-e5f6-7890-abcd-ef1234567890" />, { wrapper: createWrapper() });

    // Step 1: Trip Details
    await waitFor(() => {
      expect(screen.getByText('Auckland Museum Field Trip')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /register for this trip/i }));

    // Step 2: Registration
    await user.type(screen.getByLabelText(/student name/i), 'Emma Wilson');
    await user.type(screen.getByLabelText(/parent \/ guardian name/i), 'Sarah Wilson');
    await user.type(screen.getByLabelText(/parent \/ guardian email/i), 'sarah@example.com');
    await user.click(screen.getByRole('button', { name: /continue to payment/i }));

    // Step 3: Payment
    await waitFor(() => {
      expect(screen.getByText('Payment Details')).toBeInTheDocument();
    });
    await user.type(screen.getByLabelText(/card number/i), '1234567812345678');
    await user.type(screen.getByLabelText(/expiry date/i), '1228');
    await user.type(screen.getByLabelText(/cvv/i), '123');
    await user.click(screen.getByRole('button', { name: /pay \$25\.00 nzd/i }));

    // Step 4: Confirmation
    await waitFor(() => {
      expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
    });
    expect(screen.getByText('TXN-12345')).toBeInTheDocument();
    expect(screen.getByText('$25.00 NZD')).toBeInTheDocument();
  });
});
