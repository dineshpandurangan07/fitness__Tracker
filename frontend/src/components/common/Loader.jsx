import React from 'react';
import { Dumbbell } from 'lucide-react';

const Loader = ({ message = 'Loading fitness data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-8">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
        <Dumbbell className="w-6 h-6 text-emerald-500 absolute animate-pulse" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default Loader;
