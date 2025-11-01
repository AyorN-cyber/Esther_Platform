import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface VideoUpdate {
  date: string;
  completed: number;
  pending: number;
  total: number;
}

export const VideoChart: React.FC<{ videos: any[] }> = ({ videos }) => {
  const [updates, setUpdates] = useState<VideoUpdate[]>([]);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    // Animate on mount
    setAnimationProgress(0);
    setTimeout(() => setAnimationProgress(100), 100);

    // Load or create update history
    const history = JSON.parse(localStorage.getItem('video_update_history') || '[]');
    
    // Add current state
    const today = new Date().toISOString().split('T')[0];
    const completed = videos.filter(v => v.status === 'completed').length;
    const pending = videos.filter(v => v.status === 'pending').length;
    const total = videos.length;
    
    const existingToday = history.findIndex((h: VideoUpdate) => h.date === today);
    if (existingToday >= 0) {
      history[existingToday] = { date: today, completed, pending, total };
    } else {
      history.push({ date: today, completed, pending, total });
    }
    
    // Keep last 7 days
    const last7 = history.slice(-7);
    localStorage.setItem('video_update_history', JSON.stringify(last7));
    setUpdates(last7);
  }, [videos]);

  if (updates.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <TrendingUp size={24} className="text-purple-400" />
          Video Progress Over Time
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>No data yet. Updates will appear here as you manage videos.</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...updates.map(u => u.total), 1);
  const chartHeight = 200;

  // Calculate smooth curved path (bezier curves for zigzag effect)
  const getCurvedPath = (dataKey: 'completed' | 'pending') => {
    const points = updates.map((update, index) => ({
      x: (index / (updates.length - 1)) * 100,
      y: 100 - ((update[dataKey] / maxValue) * 100)
    }));

    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      
      // Create smooth curve with control points
      path += ` Q ${controlX},${current.y} ${controlX},${(current.y + next.y) / 2}`;
      path += ` Q ${controlX},${next.y} ${next.x},${next.y}`;
    }
    
    return path;
  };

  const completedPath = getCurvedPath('completed');
  const pendingPath = getCurvedPath('pending');

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp size={24} className="text-purple-400" />
          Video Progress Over Time
        </h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-400">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-400">Pending</span>
          </div>
        </div>
      </div>

      <div className="relative" style={{ height: `${chartHeight}px` }}>
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="completedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="pendingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(234, 179, 8)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(234, 179, 8)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={`${y}%`}
              x2="100%"
              y2={`${y}%`}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          ))}

          {/* Completed line - Curved/Zigzag */}
          <path
            d={completedPath}
            fill="none"
            stroke="rgb(34, 197, 94)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 1000,
              strokeDashoffset: 1000 - (animationProgress * 10),
              transition: 'stroke-dashoffset 2s ease-out'
            }}
          />

          {/* Pending line - Curved/Zigzag */}
          <path
            d={pendingPath}
            fill="none"
            stroke="rgb(234, 179, 8)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 1000,
              strokeDashoffset: 1000 - (animationProgress * 10),
              transition: 'stroke-dashoffset 2s ease-out'
            }}
          />

          {/* Data points */}
          {updates.map((update, index) => {
            const x = (index / (updates.length - 1)) * 100;
            const completedY = 100 - ((update.completed / maxValue) * 100);
            const pendingY = 100 - ((update.pending / maxValue) * 100);

            return (
              <g key={index}>
                {/* Completed point */}
                <circle
                  cx={`${x}%`}
                  cy={`${completedY}%`}
                  r="4"
                  fill="rgb(34, 197, 94)"
                  className="hover:r-6 transition-all cursor-pointer"
                  style={{
                    opacity: animationProgress / 100,
                    transition: 'opacity 1s ease-out'
                  }}
                >
                  <title>{`${update.completed} completed`}</title>
                </circle>

                {/* Pending point */}
                <circle
                  cx={`${x}%`}
                  cy={`${pendingY}%`}
                  r="4"
                  fill="rgb(234, 179, 8)"
                  className="hover:r-6 transition-all cursor-pointer"
                  style={{
                    opacity: animationProgress / 100,
                    transition: 'opacity 1s ease-out'
                  }}
                >
                  <title>{`${update.pending} pending`}</title>
                </circle>
              </g>
            );
          })}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-4 px-2">
        {updates.map((update, index) => (
          <div key={index} className="text-xs text-gray-400 text-center">
            {new Date(update.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
        ))}
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-800">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {updates[updates.length - 1]?.completed || 0}
          </div>
          <div className="text-xs text-gray-400">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {updates[updates.length - 1]?.pending || 0}
          </div>
          <div className="text-xs text-gray-400">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {updates[updates.length - 1]?.total || 0}
          </div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
      </div>
    </div>
  );
};
