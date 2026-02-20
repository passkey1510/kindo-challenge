import { useForm, Controller } from 'react-hook-form';
import { Lock } from 'lucide-react';
import { InputMask } from '@react-input/mask';
import type { PaymentFormData } from '../types';
import { validateCardNumber, validateExpiryDate, CVV_REGEX } from '../utils/validation';
import { FormField } from './ui/FormField';
import { inputClass } from './ui/inputClass';
import { Button } from './ui/Button';
import { ErrorAlert } from './ui/ErrorAlert';

interface PaymentFormProps {
  amount: string;
  onSubmit: (data: PaymentFormData) => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

export function PaymentForm({ amount, onSubmit, onBack, isLoading, error }: PaymentFormProps) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PaymentFormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div>
        <h2 className="text-2xl font-bold text-text">Payment Details</h2>
        <p className="mt-1 text-text-muted">Complete your payment to confirm the registration.</p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm font-medium text-text-muted">Amount to pay</span>
        <span className="text-2xl font-bold text-primary">${amount} NZD</span>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="space-y-4">
        <FormField id="card_number" label="Card Number" error={errors.card_number?.message}>
          <Controller
            name="card_number"
            control={control}
            rules={{
              required: 'Card number is required',
              validate: validateCardNumber,
            }}
            render={({ field }) => (
              <InputMask
                mask="____ ____ ____ ____"
                replacement={{ _: /\d/ }}
                id="card_number"
                inputMode="numeric"
                autoComplete="cc-number"
                className={inputClass(!!errors.card_number)}
                placeholder="0000 0000 0000 0000"
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="expiry_date" label="Expiry Date" error={errors.expiry_date?.message}>
            <Controller
              name="expiry_date"
              control={control}
              rules={{
                required: 'Expiry date is required',
                validate: validateExpiryDate,
              }}
              render={({ field }) => (
                <InputMask
                  mask="__/__"
                  replacement={{ _: /\d/ }}
                  id="expiry_date"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  className={inputClass(!!errors.expiry_date)}
                  placeholder="MM/YY"
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              )}
            />
          </FormField>

          <FormField id="cvv" label="CVV" error={errors.cvv?.message}>
            <Controller
              name="cvv"
              control={control}
              rules={{
                required: 'CVV is required',
                pattern: {
                  value: CVV_REGEX,
                  message: 'CVV must be exactly 3 digits',
                },
              }}
              render={({ field }) => (
                <InputMask
                  mask="___"
                  replacement={{ _: /\d/ }}
                  id="cvv"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  className={inputClass(!!errors.cvv)}
                  placeholder="123"
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              )}
            />
          </FormField>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Lock className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Your payment details are processed securely.</span>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1"
        >
          Back
        </Button>
        <Button type="submit" isLoading={isLoading} loadingText="Processing..." className="flex-1">
          {`Pay $${amount} NZD`}
        </Button>
      </div>
    </form>
  );
}
