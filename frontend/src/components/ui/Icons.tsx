import React from 'react';

type IconName = 'grid' | 'edit' | 'tag' | 'image' | 'folder';

export function Icon({ name, className = 'w-5 h-5' }: { name: IconName; className?: string }) {
  const labels: Record<IconName, string> = {
    grid: '#',
    edit: '+',
    tag: '@',
    image: '[]',
    folder: '~',
  };

  return (
    <span className={`${className} flex items-center justify-center font-bold`}>
      {labels[name]}
    </span>
  );
}
