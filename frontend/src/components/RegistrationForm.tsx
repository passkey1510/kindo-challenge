import { useForm } from 'react-hook-form';
import type { RegistrationFormData } from '../types';
import { EMAIL_REGEX } from '../utils/validation';
import { FormField } from './ui/FormField';
import { inputClass } from './ui/inputClass';
import { Button } from './ui/Button';
import { ErrorAlert } from './ui/ErrorAlert';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

export function RegistrationForm({ onSubmit, onBack, isLoading, error }: RegistrationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div>
        <h2 className="text-2xl font-bold text-text">Register Your Child</h2>
        <p className="mt-1 text-text-muted">Fill in the details below to register for the trip.</p>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="space-y-4">
        <FormField id="student_name" label="Student Name" error={errors.student_name?.message}>
          <input
            id="student_name"
            type="text"
            autoComplete="name"
            className={inputClass(!!errors.student_name)}
            placeholder="e.g. Emma Wilson"
            {...register('student_name', {
              required: 'Student name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
          />
        </FormField>

        <FormField
          id="parent_name"
          label="Parent / Guardian Name"
          error={errors.parent_name?.message}
        >
          <input
            id="parent_name"
            type="text"
            autoComplete="name"
            className={inputClass(!!errors.parent_name)}
            placeholder="e.g. Sarah Wilson"
            {...register('parent_name', {
              required: 'Parent name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
          />
        </FormField>

        <FormField
          id="parent_email"
          label="Parent / Guardian Email"
          error={errors.parent_email?.message}
        >
          <input
            id="parent_email"
            type="email"
            autoComplete="email"
            className={inputClass(!!errors.parent_email)}
            placeholder="e.g. sarah@example.com"
            {...register('parent_email', {
              required: 'Email is required',
              pattern: {
                value: EMAIL_REGEX,
                message: 'Please enter a valid email address',
              },
            })}
          />
        </FormField>
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
        <Button type="submit" isLoading={isLoading} loadingText="Registering..." className="flex-1">
          Continue to Payment
        </Button>
      </div>
    </form>
  );
}
