import { Check } from 'lucide-react';
import type { WizardStep } from '../types';

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'trip', label: 'Trip Details' },
  { key: 'registration', label: 'Registration' },
  { key: 'payment', label: 'Payment' },
  { key: 'confirmation', label: 'Confirmation' },
];

const stepIndex = (step: WizardStep) => STEPS.findIndex((s) => s.key === step);

interface ProgressBarProps {
  currentStep: WizardStep;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const currentIdx = stepIndex(currentStep);

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <li key={step.key} className="flex-1 flex flex-col items-center relative">
              {idx > 0 && (
                <div
                  className={`absolute top-4 -left-1/2 w-full h-0.5 transition-colors duration-300 ${
                    idx <= currentIdx ? 'bg-primary' : 'bg-border'
                  }`}
                  aria-hidden="true"
                />
              )}
              <div
                className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary text-white'
                    : isCurrent
                      ? 'bg-primary text-white ring-4 ring-primary/20'
                      : 'bg-border text-text-muted'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? <Check className="w-4 h-4" aria-hidden="true" /> : idx + 1}
              </div>
              <span
                className={`mt-2 text-xs font-medium hidden sm:block ${
                  isCurrent ? 'text-primary' : isCompleted ? 'text-primary' : 'text-text-muted'
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
