'use client';

import { cn } from '@/utils/formatters';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function TextArea({ label, error, className, id, ...props }: TextAreaProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-label-sm text-neon-violet uppercase tracking-widest mb-1 ml-1">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'w-full bg-black/40 border border-glass-border rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-text-muted/50 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-all min-h-[100px] resize-none',
          error && 'border-error focus:border-error focus:ring-error',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
