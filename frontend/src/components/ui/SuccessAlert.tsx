export default function SuccessAlert({ message }: { message: string }) {
  return (
    <div className="glass-card rounded-xl p-4 flex items-start gap-3 border-green-500/30 bg-green-500/5">
      <span className="material-symbols-outlined text-green-400 mt-0.5 flex-shrink-0">check_circle</span>
      <p className="text-sm text-green-400">{message}</p>
    </div>
  );
}
