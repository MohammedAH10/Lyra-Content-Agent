export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto glass-card rounded-2xl flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-3xl text-text-muted">inbox</span>
      </div>
      <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
      {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
