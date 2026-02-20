import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Confirmation } from '../components/Confirmation';

const mockSuccessPayment = {
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

const mockFailedPayment = {
  id: 1,
  registration: 1,
  amount: '25.00',
  card_last_four: '5678',
  status: 'failed' as const,
  transaction_id: '',
  error_message: 'Payment declined by processor.',
  attempts: 3,
  created_at: '2026-02-20T10:01:00Z',
};

describe('Confirmation', () => {
  const defaultProps = {
    onRetry: vi.fn(),
    onStartOver: vi.fn(),
  };

  it('shows success state with transaction details', () => {
    render(<Confirmation payment={mockSuccessPayment} error={null} {...defaultProps} />);

    expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
    expect(screen.getByText('TXN-12345')).toBeInTheDocument();
    expect(screen.getByText('$25.00 NZD')).toBeInTheDocument();
    expect(screen.getByText('**** 5678')).toBeInTheDocument();
    expect(screen.getByText('success')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register another student/i })).toBeInTheDocument();
  });

  it('shows error state with retry and start over buttons', () => {
    render(
      <Confirmation payment={null} error="Payment failed. Please try again." {...defaultProps} />,
    );

    expect(screen.getByText('Payment Failed')).toBeInTheDocument();
    expect(screen.getByText('Payment failed. Please try again.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start over/i })).toBeInTheDocument();
  });

  it('shows failed payment error message from processor', () => {
    render(<Confirmation payment={mockFailedPayment} error={null} {...defaultProps} />);

    expect(screen.getByText('Payment Failed')).toBeInTheDocument();
    expect(screen.getByText('Payment declined by processor.')).toBeInTheDocument();
  });

  it('calls onRetry when Try Again is clicked', async () => {
    const user = userEvent.setup();
    render(<Confirmation payment={null} error="Payment failed" {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(defaultProps.onRetry).toHaveBeenCalledOnce();
  });

  it('calls onStartOver when Start Over is clicked', async () => {
    const user = userEvent.setup();
    render(<Confirmation payment={mockSuccessPayment} error={null} {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /register another student/i }));
    expect(defaultProps.onStartOver).toHaveBeenCalledOnce();
  });
});
