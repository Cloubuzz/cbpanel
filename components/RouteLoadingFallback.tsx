import React from 'react';

export const RouteLoadingFallback: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center py-24">
    <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
  </div>
);
