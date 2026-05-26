import { cn } from '@/utils/formatters';

export default function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('glass-card rounded-2xl p-6 backdrop-blur-[12px]', className)}>
      {children}
    </div>
  );
}
