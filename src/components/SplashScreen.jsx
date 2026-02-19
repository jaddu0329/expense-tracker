import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function SplashScreen({ fadeOut }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white via-indigo-50 to-violet-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 transition-opacity duration-700 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-[350px] h-[350px] sm:w-[450px] sm:h-[450px]">
          <DotLottieReact
              src="https://lottie.host/3417e48f-7cc7-4b1d-8d81-2096aaf6b3f5/eIjIMkazRR.lottie"
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
        </div>
        <p className="text-sm font-semibold tracking-widest uppercase text-indigo-500 dark:text-indigo-400 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
