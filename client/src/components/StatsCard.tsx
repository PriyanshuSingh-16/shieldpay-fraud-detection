import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor: string;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  iconColor 
}: StatsCardProps) {
  const changeColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-yellow-400'
  };

  return (
    <div className="shield-bg-surface p-6 rounded-lg shield-border border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
        </div>
        <div className={`w-12 h-12 ${iconColor} bg-opacity-20 rounded-lg flex items-center justify-center`}>
          <Icon className={`${iconColor.replace('bg-', 'text-')}`} />
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm ${changeColors[changeType]}`}>{change}</span>
          <span className="text-gray-400 text-sm ml-2">from last week</span>
        </div>
      )}
    </div>
  );
}
