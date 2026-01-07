import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const StatCard = ({ title, value, icon, trend, color = 'blue' }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-600 to-blue-700',
    green: 'bg-gradient-to-br from-green-600 to-green-700',
    yellow: 'bg-gradient-to-br from-yellow-600 to-amber-700',
    red: 'bg-gradient-to-br from-red-600 to-red-700',
    purple: 'bg-gradient-to-br from-purple-600 to-purple-700',
  };

  const iconColorClasses = {
    blue: 'bg-blue-500/20 text-blue-300',
    green: 'bg-green-500/20 text-green-300',
    yellow: 'bg-yellow-500/20 text-yellow-300',
    red: 'bg-red-500/20 text-red-300',
    purple: 'bg-purple-500/20 text-purple-300',
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/10`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/80 mb-2">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 font-semibold ${trend.isPositive ? 'text-green-200' : 'text-red-200'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className={`${iconColorClasses[color]} p-4 rounded-full text-2xl backdrop-blur-sm`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
