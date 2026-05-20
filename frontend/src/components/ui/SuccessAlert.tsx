export default function SuccessAlert({ message }: { message: string }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
      <span className="text-green-500 text-xl">✅</span>
      <p className="text-sm text-green-800">{message}</p>
    </div>
  );
}
