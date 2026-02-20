import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function SplashScreen({ fadeOut }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate the progress bar from 0 to 100 over ~3.8s
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + (100 / (3800 / 50)); // ~50ms tick
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-700 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
      <div className="absolute bottom-[-80px] right-[-80px] w-72 h-72 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

      <div className="relative flex flex-col items-center gap-6 px-8">
        {/* Lottie animation */}
        <div className="w-64 h-64 sm:w-80 sm:h-80 drop-shadow-2xl">
          <DotLottieReact
            src="/animation.lottie"
            loop
            autoplay
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* App title */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Expense <span style={{ color: '#818cf8' }}>Tracker</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400 tracking-widest uppercase">
            Smart Finance Manager
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-56 sm:w-72">
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
                transition: 'width 0.05s linear',
              }}
            />
          </div>
          <p className="mt-2 text-center text-xs font-medium tracking-widest uppercase"
            style={{ color: '#a5b4fc' }}>
            Loading&hellip;
          </p>
        </div>
      </div>
    </div>
  );
}
