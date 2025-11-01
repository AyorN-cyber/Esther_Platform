import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50">
      <div className="relative">
        {/* Spinning circles */}
        <div className="w-32 h-32 relative">
          <div className="absolute inset-0 border-4 border-purple-600/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-transparent border-t-pink-600 rounded-full animate-spin-slow"></div>
          <div className="absolute inset-4 border-4 border-transparent border-t-blue-600 rounded-full animate-spin-reverse"></div>
        </div>
        
        {/* Pulsing center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-pulse"></div>
        </div>
        
        {/* Loading text with neon glow */}
        <div className="mt-8 text-center">
          <p className="text-white text-xl font-bold animate-pulse neon-text">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
};
