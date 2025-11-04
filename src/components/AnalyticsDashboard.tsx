import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Eye, Video, DollarSign, Target, Bell } from 'lucide-react';
import { getAnalyticsSummary, getAnalyticsVisitors } from '../lib/supabaseEnhanced';
import { useTheme } from '../contexts/ThemeContext';
import type { AnalyticsSummary, AnalyticsVisitor } from '../types';

export const AnalyticsDashboard = () => {
  const { theme } = useTheme();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [visitors, setVisitors] = useState<AnalyticsVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const summaryData = await getAnalyticsSummary();
      setSummary(summaryData);

      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const visitorsData = await getAnalyticsVisitors(
        startDate.toISOString().split('T')[0]
      );
      setVisitors(visitorsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
    setLoading(false);
  };

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Visitors',
      value: summary.totalVisitors.toLocaleString(),
      change: summary.growthRate,
      icon: Users,
      color: 'purple'
    },
    {
      label: 'Total Views',
      value: summary.totalViews.toLocaleString(),
      change: 0,
      icon: Eye,
      color: 'blue'
    },
    {
      label: 'Videos',
      value: summary.totalVideos,
      subtext: `${summary.completedVideos} completed`,
      icon: Video,
      color: 'pink'
    },
    {
      label: 'Net Profit',
      value: `₦${summary.netProfit.toLocaleString()}`,
      change: 0,
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'Active Goals',
      value: summary.activeGoals,
      subtext: `${summary.completedGoals} completed`,
      icon: Target,
      color: 'orange'
    },
    {
      label: 'Notifications',
      value: summary.unreadNotifications,
      subtext: `${summary.unreadMessages} messages`,
      icon: Bell,
      color: 'red'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      purple: 'from-purple-500 to-purple-600',
      blue: 'from-blue-500 to-blue-600',
      pink: 'from-pink-500 to-pink-600',
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600'
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Analytics Dashboard
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Track your ministry's growth and impact
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`p-6 rounded-xl border transition-all hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${getColorClasses(stat.color)}`}>
                  <Icon size={24} className="text-white" />
                </div>
                {stat.change !== undefined && stat.change !== 0 && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.change > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {Math.abs(stat.change).toFixed(1)}%
                  </div>
                )}
              </div>
              <div>
                <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
                {stat.subtext && (
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {stat.subtext}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Visitor Trend Chart */}
      <div className={`p-6 rounded-xl border ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Visitor Trend
        </h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {visitors.slice(0, 14).reverse().map((visitor, index) => {
            const maxVisitors = Math.max(...visitors.map(v => v.visitor_count));
            const height = (visitor.visitor_count / maxVisitors) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full">
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-pink-400 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                    style={{ height: `${height}%`, minHeight: '20px' }}
                    title={`${visitor.visitor_count} visitors`}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {visitor.visitor_count} visitors
                    </div>
                  </div>
                </div>
                <div className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {new Date(visitor.visitor_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Device Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Types */}
        <div className={`p-6 rounded-xl border ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Device Types
          </h3>
          <div className="space-y-3">
            {['mobile', 'desktop', 'tablet'].map((device) => {
              const count = visitors.filter(v => v.device_type === device).length;
              const percentage = visitors.length > 0 ? (count / visitors.length) * 100 : 0;
              
              return (
                <div key={device}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {device}
                    </span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className={`p-6 rounded-xl border ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Quick Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg. Engagement
              </span>
              <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {summary.avgEngagement.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Completion Rate
              </span>
              <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {summary.totalVideos > 0 
                  ? ((summary.completedVideos / summary.totalVideos) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Goal Progress
              </span>
              <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {summary.activeGoals + summary.completedGoals > 0
                  ? ((summary.completedGoals / (summary.activeGoals + summary.completedGoals)) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
