import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-navy hover:bg-primary text-white',
  secondary: 'bg-white border border-border hover:bg-bg text-text',
};

export function Button({
  variant = 'primary',
  isLoading = false,
  loadingText,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`cursor-pointer font-semibold py-3 px-6 rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          {loadingText || children}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}
