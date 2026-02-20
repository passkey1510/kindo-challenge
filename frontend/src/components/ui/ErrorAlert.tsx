interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="p-4 bg-error/10 border border-error/20 rounded-xl" role="alert">
      <p className="text-sm text-error font-medium">{message}</p>
    </div>
  );
}
