/**
 * Dashboard Charts Component with Animated Line Charts
 * Features: Animated line charts for video updates, login frequency, site visits
 */

import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Video as VideoIcon, LogIn } from 'lucide-react';

interface ChartDataPoint {
  date: string;
  value: number;
}

interface DashboardChartsProps {
  videoUpdates: ChartDataPoint[];
  loginFrequency: ChartDataPoint[];
  siteVisits: ChartDataPoint[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  videoUpdates,
  loginFrequency,
  siteVisits
}) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setAnimated(true), 100);
  }, []);

  const maxValue = Math.max(
    ...videoUpdates.map(d => d.value),
    ...loginFrequency.map(d => d.value),
    ...siteVisits.map(d => d.value),
    1
  );

  const renderAnimatedLineChart = (
    data: ChartDataPoint[], 
    color: string, 
    gradientId: string,
    icon: React.ReactNode
  ) => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-purple-300">
          <p>No data available</p>
        </div>
      );
    }

    const points = data.map((point, index) => {
      const x = (index / (data.length - 1 || 1)) * 100;
      const y = 100 - (point.value / maxValue) * 80;
      return { x, y };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    const areaPath = `${pathData} L ${points[points.length - 1].x},100 L 0,100 Z`;

    return (
      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {/* Animated Area Fill */}
          <path
            d={areaPath}
            fill={`url(#${gradientId})`}
            className={animated ? 'animate-fade-in' : 'opacity-0'}
            style={{
              animation: animated ? 'drawPath 1.5s ease-out forwards' : 'none',
              strokeDasharray: animated ? '0' : '1000',
              strokeDashoffset: animated ? '0' : '1000'
            }}
          />
          
          {/* Animated Line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={animated ? 'animate-fade-in' : 'opacity-0'}
            style={{
              animation: animated ? 'drawLine 1.5s ease-out forwards' : 'none',
              strokeDasharray: animated ? '1000' : '0',
              strokeDashoffset: animated ? '0' : '1000'
            }}
          />
          
          {/* Animated Data Points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="1.5"
                fill={color}
                className={animated ? 'animate-scale-in' : 'opacity-0'}
                style={{
                  animation: animated 
                    ? `fadeInScale 0.3s ease-out ${0.5 + index * 0.1}s forwards` 
                    : 'none'
                }}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill={color}
                fillOpacity="0.2"
                className={animated ? 'animate-pulse' : 'opacity-0'}
                style={{
                  animation: animated 
                    ? `fadeInScale 0.3s ease-out ${0.5 + index * 0.1}s forwards, pulse 2s ease-in-out infinite ${1 + index * 0.1}s` 
                    : 'none'
                }}
              />
            </g>
          ))}
        </svg>
        
        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-purple-300 px-2">
          {data.map((point, index) => {
            const date = new Date(point.date);
            const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return (
              <span 
                key={index} 
                className="transform -rotate-45 origin-left"
                style={{ 
                  opacity: animated ? 1 : 0,
                  transition: `opacity 0.3s ${0.8 + index * 0.1}s`
                }}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        @keyframes drawPath {
          to {
            opacity: 1;
          }
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.2);
          }
        }
      `}</style>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Video Updates Chart */}
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <VideoIcon size={20} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Video Updates</h3>
              <p className="text-xs text-purple-300">Last 7 days</p>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-2xl font-black text-white">
              {videoUpdates.reduce((sum, d) => sum + d.value, 0)}
            </p>
          </div>
          {renderAnimatedLineChart(videoUpdates, '#9333ea', 'gradient-purple', <VideoIcon />)}
        </div>

        {/* Login Frequency Chart */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <LogIn size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Login Frequency</h3>
              <p className="text-xs text-blue-300">Last 7 days</p>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-2xl font-black text-white">
              {loginFrequency.reduce((sum, d) => sum + d.value, 0)}
            </p>
          </div>
          {renderAnimatedLineChart(loginFrequency, '#3b82f6', 'gradient-blue', <LogIn />)}
        </div>

        {/* Site Visits Chart */}
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Site Visits</h3>
              <p className="text-xs text-green-300">Last 7 days</p>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-2xl font-black text-white">
              {siteVisits.reduce((sum, d) => sum + d.value, 0)}
            </p>
          </div>
          {renderAnimatedLineChart(siteVisits, '#10b981', 'gradient-green', <Users />)}
        </div>
      </div>
    </>
  );
};
