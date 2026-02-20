export const inputClass = (hasError: boolean) =>
  `w-full px-4 py-3 rounded-xl border bg-white text-text transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
    hasError ? 'border-error' : 'border-border hover:border-primary/40'
  }`;
