import React, { useState, useEffect, useRef } from 'react';
import { BrandLogo } from './BrandLogo';
import { BRAND_CONFIG } from './brandConfig';
import { Play, Pause, Volume2, VolumeX, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface BrandSplashScreenProps {
  onComplete: () => void;
  autoPlay?: boolean;
}

export const BrandSplashScreen: React.FC<BrandSplashScreenProps> = ({
  onComplete,
  autoPlay = true
}) => {
  const [videoMode, setVideoMode] = useState<'video' | 'fallback'>('video');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      onComplete();
    }
  }, [onComplete]);

  // Video playback initialization
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    if (autoPlay) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('[BrandIntro] Autoplay prevented or file missing, switching to muted/fallback:', err);
            // Autoplay policy handling: ensure muted and retry
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {
              // Video file not loadable -> fallback to animated branding stage
              setVideoMode('fallback');
            });
          });
      }
    }
  }, [autoPlay]);

  // Handle Video Events
  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      setVideoLoaded(true);
      setVideoMode('video');
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 1;
      setCurrentTime(cur);
      setProgress(Math.min(100, (cur / dur) * 100));
    }
  };

  const handleVideoEnded = () => {
    onComplete();
  };

  const handleVideoError = () => {
    console.info('[BrandIntro] brand_intro.mp4 not found or could not be decoded. Activating procedural fallback engine.');
    setVideoError('Файл brand_intro.mp4 не найден на сервере — активен процедурный брендинг');
    setVideoMode('fallback');
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  // Procedural Canvas Animation for Fallback Mode
  useEffect(() => {
    if (videoMode !== 'fallback') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }
    const particles: Particle[] = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.6 + 0.2
    }));

    let step = 0;
    const render = () => {
      step++;
      ctx.clearRect(0, 0, width, height);

      // Floor grid
      ctx.strokeStyle = 'rgba(0, 163, 224, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Scanning beam
      const scanY = (step * 2.5) % height;
      const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      grad.addColorStop(0, 'rgba(0, 163, 224, 0)');
      grad.addColorStop(0.5, 'rgba(0, 163, 224, 0.25)');
      grad.addColorStop(1, 'rgba(0, 163, 224, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 20, width, 40);

      // Particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `rgba(0, 163, 224, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animFrame = requestAnimationFrame(render);
    };

    render();

    // Fallback progress timer
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / 4500) * 100);
      setProgress(pct);
      if (pct >= 100) {
        onComplete();
      }
    }, 30);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrame);
      clearInterval(interval);
    };
  }, [videoMode, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none">
      {/* Top Header Controls: Sound, Skip, Status */}
      <div className="absolute top-3 sm:top-6 left-3 sm:left-6 right-3 sm:right-6 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 z-30">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-mono font-semibold tracking-widest text-cyan-400 uppercase truncate">
            BRANDING // {BRAND_CONFIG.name}
          </span>
          {videoMode === 'video' && videoLoaded && (
            <span className="hidden xs:inline ml-1 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-[9px] font-mono text-emerald-300">
              MP4 ACTIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
          {videoMode === 'video' && (
            <button
              onClick={togglePlay}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors min-h-[36px] cursor-pointer"
              title={isPlaying ? 'Пауза' : 'Воспроизведение'}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-cyan-400" />}
              <span className="text-[10px] font-medium hidden xs:inline">{isPlaying ? 'Пауза' : 'Пуск'}</span>
            </button>
          )}

          <button
            onClick={toggleMute}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors min-h-[36px] cursor-pointer"
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5 text-slate-400" /> : <Volume2 className="h-3.5 w-3.5 text-cyan-400" />}
            <span className="text-[10px] font-medium hidden xs:inline">{isMuted ? 'Звук выкл' : 'Звук вкл'}</span>
          </button>

          <button
            onClick={onComplete}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 min-h-[36px] cursor-pointer"
          >
            <span>В систему</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Video Viewport (Desktop / Mobile / PWA responsive) */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Real Video Player */}
        <video
          ref={videoRef}
          src="/brand_intro.mp4"
          playsInline
          autoPlay={autoPlay}
          muted={isMuted}
          preload="auto"
          onLoadedMetadata={handleVideoLoadedMetadata}
          onTimeUpdate={handleVideoTimeUpdate}
          onEnded={handleVideoEnded}
          onError={handleVideoError}
          className={`absolute inset-0 w-full h-full object-contain z-10 transition-opacity duration-700 ${
            videoMode === 'video' && videoLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Fallback Procedural Animation Stage (Active when video is loading or absent) */}
        {videoMode === 'fallback' && (
          <>
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-80" />

            <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-xl mx-auto">
              <div className="absolute -inset-10 rounded-full bg-cyan-500/10 filter blur-3xl -z-10 animate-pulse" />

              <div className="transition-all duration-700 transform scale-100 opacity-100">
                <BrandLogo
                  variant="full"
                  theme="white"
                  size="2xl"
                  showSubtitle={true}
                  animated={true}
                />
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-md">
                {BRAND_CONFIG.engineeringDomains.map((dom) => (
                  <div
                    key={dom.id}
                    className="px-2.5 py-1 rounded-md border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 text-[10px] font-mono shadow-sm"
                  >
                    {dom.code}: {dom.title.split('&')[0]}
                  </div>
                ))}
              </div>

              {videoError && (
                <div className="mt-4 px-3 py-1 rounded-md bg-amber-950/40 border border-amber-500/30 text-amber-300/80 text-[10px] font-mono flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3 text-amber-400" />
                  <span>{videoError}</span>
                </div>
              )}

              <div className="mt-6 font-mono text-xs text-slate-400 flex items-center justify-center gap-2">
                {progress >= 95 ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> СИСТЕМА ГОТОВА К РАБОТЕ
                  </span>
                ) : (
                  <span>ИНИЦИАЛИЗАЦИЯ ИНЖЕНЕРНОГО КОНТУРА... {Math.round(progress)}%</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Sync Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 z-30">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
