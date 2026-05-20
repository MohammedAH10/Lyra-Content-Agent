export default function SuccessAlert({ message }: { message: string }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm text-green-800">{message}</p>
    </div>
  );
}
