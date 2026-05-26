import React from 'react';

type IconName = 'grid' | 'edit' | 'tag' | 'image' | 'folder';

export function Icon({ name, className = 'w-5 h-5' }: { name: IconName; className?: string }) {
  const iconMap: Record<IconName, string> = {
    grid: 'dashboard',
    edit: 'edit',
    tag: 'tag',
    image: 'image',
    folder: 'folder',
  };

  return (
    <span className={`material-symbols-outlined ${className}`} style={{ fontSize: 'inherit' }}>
      {iconMap[name]}
    </span>
  );
}
