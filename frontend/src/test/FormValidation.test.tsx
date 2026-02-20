import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegistrationForm } from '../components/RegistrationForm';
import { PaymentForm } from '../components/PaymentForm';

describe('RegistrationForm validation', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onBack: vi.fn(),
    isLoading: false,
    error: null,
  };

  it('shows required errors when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /continue to payment/i }));

    await waitFor(() => {
      expect(screen.getByText('Student name is required')).toBeInTheDocument();
    });
    expect(screen.getByText('Parent name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('shows error for invalid email', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/student name/i), 'Emma Wilson');
    await user.type(screen.getByLabelText(/parent \/ guardian name/i), 'Sarah Wilson');
    await user.type(screen.getByLabelText(/parent \/ guardian email/i), 'notanemail');
    await user.click(screen.getByRole('button', { name: /continue to payment/i }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('shows error for short names', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/student name/i), 'E');
    await user.type(screen.getByLabelText(/parent \/ guardian name/i), 'S');
    await user.type(screen.getByLabelText(/parent \/ guardian email/i), 'sarah@example.com');
    await user.click(screen.getByRole('button', { name: /continue to payment/i }));

    await waitFor(() => {
      expect(screen.getAllByText('Name must be at least 2 characters')).toHaveLength(2);
    });
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with valid data', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/student name/i), 'Emma Wilson');
    await user.type(screen.getByLabelText(/parent \/ guardian name/i), 'Sarah Wilson');
    await user.type(screen.getByLabelText(/parent \/ guardian email/i), 'sarah@example.com');
    await user.click(screen.getByRole('button', { name: /continue to payment/i }));

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        {
          student_name: 'Emma Wilson',
          parent_name: 'Sarah Wilson',
          parent_email: 'sarah@example.com',
        },
        expect.anything(),
      );
    });
  });

  it('displays API error when provided', () => {
    render(<RegistrationForm {...defaultProps} error="Registration failed" />);
    expect(screen.getByText('Registration failed')).toBeInTheDocument();
  });

  it('disables buttons when loading', () => {
    render(<RegistrationForm {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('button', { name: /registering/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();
  });
});

describe('PaymentForm validation', () => {
  const defaultProps = {
    amount: '25.00',
    onSubmit: vi.fn(),
    onBack: vi.fn(),
    isLoading: false,
    error: null,
  };

  it('shows required errors when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<PaymentForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /pay \$25\.00 nzd/i }));

    await waitFor(() => {
      expect(screen.getByText('Card number is required')).toBeInTheDocument();
    });
    expect(screen.getByText('Expiry date is required')).toBeInTheDocument();
    expect(screen.getByText('CVV is required')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('shows error for invalid card number', async () => {
    const user = userEvent.setup();
    render(<PaymentForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/card number/i), '12345');
    await user.type(screen.getByLabelText(/expiry date/i), '1228');
    await user.type(screen.getByLabelText(/cvv/i), '123');
    await user.click(screen.getByRole('button', { name: /pay \$25\.00 nzd/i }));

    await waitFor(() => {
      expect(screen.getByText('Card number must be exactly 16 digits')).toBeInTheDocument();
    });
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('shows error for invalid CVV', async () => {
    const user = userEvent.setup();
    render(<PaymentForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/card number/i), '1234567812345678');
    await user.type(screen.getByLabelText(/expiry date/i), '1228');
    await user.type(screen.getByLabelText(/cvv/i), '12');
    await user.click(screen.getByRole('button', { name: /pay \$25\.00 nzd/i }));

    await waitFor(() => {
      expect(screen.getByText('CVV must be exactly 3 digits')).toBeInTheDocument();
    });
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with valid payment data', async () => {
    const user = userEvent.setup();
    render(<PaymentForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/card number/i), '1234567812345678');
    await user.type(screen.getByLabelText(/expiry date/i), '1228');
    await user.type(screen.getByLabelText(/cvv/i), '123');
    await user.click(screen.getByRole('button', { name: /pay \$25\.00 nzd/i }));

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          expiry_date: '12/28',
          cvv: '123',
        }),
        expect.anything(),
      );
    });
  });

  it('displays amount correctly', () => {
    render(<PaymentForm {...defaultProps} />);
    expect(screen.getByText('$25.00 NZD')).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    render(<PaymentForm {...defaultProps} error="Payment declined" />);
    expect(screen.getByText('Payment declined')).toBeInTheDocument();
  });

  it('shows loading state during payment', () => {
    render(<PaymentForm {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled();
  });
});
