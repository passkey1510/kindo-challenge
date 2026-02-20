import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { inputClass } from './inputClass';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  children?: ReactNode;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, error, id, children, ...inputProps },
  ref,
) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-text mb-1.5">
        {label}
      </label>
      {children || <input id={id} ref={ref} className={inputClass(!!error)} {...inputProps} />}
      {error && (
        <p className="mt-1.5 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
