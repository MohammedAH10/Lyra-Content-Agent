'use client';

import { SOCIAL_PLATFORMS, STATUS_LABELS } from '@/utils/constants';
import type { SocialPlatform } from '@/types';

export default function PlatformSelector({
  selected,
  onChange,
}: {
  selected: SocialPlatform[];
  onChange: (platforms: SocialPlatform[]) => void;
}) {
  const toggle = (platform: SocialPlatform) => {
    if (selected.includes(platform)) {
      onChange(selected.filter((p) => p !== platform));
    } else {
      onChange([...selected, platform]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Publish to</label>
      <div className="flex gap-3">
        {SOCIAL_PLATFORMS.map((platform) => {
          const isSelected = selected.includes(platform as SocialPlatform);
          const colors: Record<string, string> = {
            twitter: 'border-black data-[selected=true]:bg-black data-[selected=true]:text-white',
            instagram: 'border-pink-600 data-[selected=true]:bg-pink-600 data-[selected=true]:text-white',
            linkedin: 'border-blue-700 data-[selected=true]:bg-blue-700 data-[selected=true]:text-white',
          };
          return (
            <button
              key={platform}
              data-selected={isSelected}
              onClick={() => toggle(platform as SocialPlatform)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                isSelected
                  ? (platform === 'twitter' ? 'bg-black text-white border-black' :
                     platform === 'instagram' ? 'bg-pink-600 text-white border-pink-600' :
                     'bg-blue-700 text-white border-blue-700')
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {platform === 'twitter' ? '𝕏' : platform === 'instagram' ? '📷' : '💼'} {STATUS_LABELS[platform] || platform}
            </button>
          );
        })}
      </div>
    </div>
  );
}
