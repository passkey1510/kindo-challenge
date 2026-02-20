import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import type { PaymentResponse } from '../types';
import { Button } from './ui/Button';

interface ConfirmationProps {
  payment: PaymentResponse | null;
  error: string | null;
  onRetry: () => void;
  onStartOver: () => void;
}

export function Confirmation({ payment, error, onRetry, onStartOver }: ConfirmationProps) {
  const isSuccess = payment?.status === 'success';

  if (error || !isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-error" aria-hidden="true" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-text">Payment Failed</h2>
          <p className="mt-2 text-text-muted">
            {error ||
              payment?.error_message ||
              'Something went wrong with your payment. Please try again.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onRetry} icon={<RotateCcw className="w-4 h-4" aria-hidden="true" />}>
            Try Again
          </Button>
          <Button variant="secondary" onClick={onStartOver}>
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-success" aria-hidden="true" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-text">Payment Successful!</h2>
        <p className="mt-2 text-text-muted">
          Your registration has been confirmed. A receipt has been sent to your email.
        </p>
      </div>

      <div className="bg-bg border border-border rounded-xl p-6 text-left space-y-3 max-w-sm mx-auto">
        <div className="flex justify-between">
          <span className="text-sm text-text-muted">Transaction ID</span>
          <span className="text-sm font-mono font-semibold text-text">
            {payment.transaction_id}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-text-muted">Amount Paid</span>
          <span className="text-sm font-semibold text-text">${payment.amount} NZD</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-text-muted">Card</span>
          <span className="text-sm font-mono text-text">**** {payment.card_last_four}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-text-muted">Status</span>
          <span className="text-sm font-semibold text-success capitalize">{payment.status}</span>
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={onStartOver}>Register Another Student</Button>
      </div>
    </div>
  );
}
