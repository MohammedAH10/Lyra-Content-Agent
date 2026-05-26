export default function ErrorAlert({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="glass-card rounded-xl p-4 flex items-start gap-3 border-error/30 bg-error/5">
      <span className="material-symbols-outlined text-error mt-0.5 flex-shrink-0">error</span>
      <div className="flex-1">
        <p className="text-sm text-error">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-error hover:brightness-125 flex-shrink-0"
        >
          Retry
        </button>
      )}
    </div>
  );
}
