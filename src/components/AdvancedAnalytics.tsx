import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Eye, Clock, MapPin, Smartphone, Globe, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AnalyticsData {
  pageViews: { date: string; views: number }[];
  topPages: { page: string; views: number }[];
  userLocations: { country: string; users: number }[];
  deviceBreakdown: { device: string; percentage: number }[];
  peakHours: { hour: number; activity: number }[];
  userRetention: { week: string; rate: number }[];
}

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    pageViews: [],
    topPages: [],
    userLocations: [],
    deviceBreakdown: [],
    peakHours: [],
    userRetention: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      // Simulate loading analytics data
      // In production, this would fetch from your analytics service
      setAnalytics({
        pageViews: generatePageViews(),
        topPages: [
          { page: '/home', views: 1250 },
          { page: '/videos', views: 890 },
          { page: '/about', views: 650 },
          { page: '/contact', views: 420 },
          { page: '/gallery', views: 380 }
        ],
        userLocations: [
          { country: 'United States', users: 450 },
          { country: 'United Kingdom', users: 280 },
          { country: 'Canada', users: 190 },
          { country: 'Australia', users: 150 },
          { country: 'Germany', users: 120 }
        ],
        deviceBreakdown: [
          { device: 'Mobile', percentage: 65 },
          { device: 'Desktop', percentage: 28 },
          { device: 'Tablet', percentage: 7 }
        ],
        peakHours: generatePeakHours(),
        userRetention: generateRetention()
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePageViews = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: Math.floor(Math.random() * 500) + 200
      };
    });
  };

  const generatePeakHours = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      activity: Math.floor(Math.random() * 100) + 20
    }));
  };

  const generateRetention = () => {
    return Array.from({ length: 8 }, (_, i) => ({
      week: `Week ${i + 1}`,
      rate: Math.max(100 - (i * 8) - Math.random() * 10, 30)
    }));
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
          <p className="text-gray-400 mt-1">Deep insights into user behavior and engagement</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Page Views</p>
              <p className="text-2xl font-bold text-white mt-1">
                {analytics.pageViews.reduce((acc, pv) => acc + pv.views, 0).toLocaleString()}
              </p>
              <p className="text-green-400 text-xs mt-1">↑ 12.5% vs last period</p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Unique Visitors</p>
              <p className="text-2xl font-bold text-white mt-1">
                {analytics.userLocations.reduce((acc, loc) => acc + loc.users, 0).toLocaleString()}
              </p>
              <p className="text-green-400 text-xs mt-1">↑ 8.3% vs last period</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Session Time</p>
              <p className="text-2xl font-bold text-white mt-1">4m 32s</p>
              <p className="text-green-400 text-xs mt-1">↑ 15.2% vs last period</p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Bounce Rate</p>
              <p className="text-2xl font-bold text-white mt-1">32.4%</p>
              <p className="text-red-400 text-xs mt-1">↓ 5.1% vs last period</p>
            </div>
            <Activity className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Page Views Chart */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Page Views Over Time</h3>
        <div className="h-64 flex items-end justify-between gap-1">
          {analytics.pageViews.map((pv, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-gradient-to-t from-purple-600 to-pink-600 rounded-t hover:from-purple-500 hover:to-pink-500 transition-all cursor-pointer relative group"
                style={{ height: `${(pv.views / Math.max(...analytics.pageViews.map(p => p.views))) * 100}%` }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {pv.views} views
                </div>
              </div>
              {i % Math.ceil(analytics.pageViews.length / 7) === 0 && (
                <span className="text-xs text-gray-400">{pv.date}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Pages
          </h3>
          <div className="space-y-3">
            {analytics.topPages.map((page, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{page.page}</span>
                    <span className="text-gray-400 text-sm">{page.views.toLocaleString()} views</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                      style={{ width: `${(page.views / analytics.topPages[0].views) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Locations */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Top Locations
          </h3>
          <div className="space-y-3">
            {analytics.userLocations.map((loc, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{loc.country}</span>
                    <span className="text-gray-400 text-sm">{loc.users.toLocaleString()} users</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full"
                      style={{ width: `${(loc.users / analytics.userLocations[0].users) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Device Breakdown
          </h3>
          <div className="space-y-4">
            {analytics.deviceBreakdown.map((device, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <span className="text-white">{device.device}</span>
                  <span className="text-gray-400">{device.percentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-600 to-emerald-600 h-3 rounded-full"
                    style={{ width: `${device.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Peak Activity Hours
          </h3>
          <div className="h-48 flex items-end justify-between gap-1">
            {analytics.peakHours.filter((_, i) => i % 2 === 0).map((hour, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-yellow-600 to-orange-600 rounded-t hover:from-yellow-500 hover:to-orange-500 transition-all cursor-pointer"
                  style={{ height: `${hour.activity}%` }}
                />
                <span className="text-xs text-gray-400">{hour.hour}:00</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
