import { Crown } from 'lucide-react';

interface PremiumBadgeProps {
  className?: string;
}

export default function PremiumBadge({ className = '' }: PremiumBadgeProps) {
  return (
    <span
      className={`relative group inline-flex items-center cursor-default ${className}`}
      title="Premium User"
    >
      <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        Premium User
      </span>
    </span>
  );
}
