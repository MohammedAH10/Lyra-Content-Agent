'use client';

import { cn } from '@/utils/formatters';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export default function Select({ label, options, className, id, ...props }: SelectProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-label-sm text-neon-violet uppercase tracking-widest mb-1 ml-1">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'w-full bg-black/40 border border-glass-border rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-all',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface-container">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
