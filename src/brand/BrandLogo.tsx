import React from 'react';
import { BRAND_CONFIG } from './brandConfig';

export interface BrandLogoProps {
  variant?: 'full' | 'horizontal' | 'compact' | 'symbol-only' | 'wordmark-only';
  theme?: 'light' | 'dark' | 'white' | 'monochrome';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  className?: string;
  showSubtitle?: boolean;
  brandText?: 'SKKit' | 'KIT' | 'СК-КИТ';
  animated?: boolean;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  theme = 'light',
  size = 'md',
  className = '',
  showSubtitle = true,
  brandText = 'СК-КИТ',
  animated = false,
  onClick
}) => {
  // Color resolution based on theme
  const navyColor = theme === 'dark' || theme === 'white' ? '#FFFFFF' : BRAND_CONFIG.colors.primaryNavy;
  const cyanColor = BRAND_CONFIG.colors.electricCyan;
  const subtitleColor = theme === 'dark' || theme === 'white' ? '#94A3B8' : '#0B2A5E';

  // Dimension mapping
  let scale = 1;
  if (typeof size === 'number') {
    scale = size / 40;
  } else {
    switch (size) {
      case 'xs': scale = 0.6; break;
      case 'sm': scale = 0.8; break;
      case 'md': scale = 1.0; break;
      case 'lg': scale = 1.35; break;
      case 'xl': scale = 1.8; break;
      case '2xl': scale = 2.4; break;
    }
  }

  // Hexagon Emblem Symbol Vector
  const renderBadgeSymbol = (badgeSize: number) => {
    return (
      <svg
        width={badgeSize}
        height={badgeSize}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${animated ? 'animate-pulse' : ''} transition-transform hover:scale-105`}
      >
        <defs>
          <linearGradient id="cyanGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00C0FF" />
            <stop offset="100%" stopColor="#0090D0" />
          </linearGradient>
          <linearGradient id="navyBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme === 'white' ? '#FFFFFF' : '#0B2A5E'} />
            <stop offset="100%" stopColor={theme === 'white' ? '#E2E8F0' : '#061A3A'} />
          </linearGradient>
          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Hexagonal Tech Frame with Circuit Nodes */}
        <path
          d="M200 24 L345 108 V292 L200 376 L55 292 V108 Z"
          stroke="url(#navyBadgeGrad)"
          strokeWidth="18"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />

        {/* Tech Circuit Node Interconnect Lines & Dots */}
        <g stroke={cyanColor} strokeWidth="6" strokeLinecap="round">
          {/* Bottom Left Circuit */}
          <path d="M100 280 L145 320 L165 320" />
          <circle cx="165" cy="320" r="5" fill={cyanColor} />
          {/* Bottom Right Circuit */}
          <path d="M300 280 L255 320 L235 320" />
          <circle cx="235" cy="320" r="5" fill={cyanColor} />
          {/* Top Center Junction */}
          <path d="M200 45 V75" />
          <circle cx="200" cy="75" r="4.5" fill={cyanColor} />
        </g>

        {/* 1. TOP: CCTV Surveillance Camera (12 o'clock) */}
        <g transform="translate(145, 60)" fill="none" stroke={navyColor} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
          {/* Camera housing */}
          <path d="M20 30 L85 10 L95 28 L30 48 Z" fill={navyColor} fillOpacity="0.1" />
          <path d="M20 30 L85 10 L95 28 L30 48 Z" />
          {/* Lens hood */}
          <path d="M85 10 L102 6 L108 24 L95 28 Z" fill={cyanColor} stroke={cyanColor} strokeWidth="4" />
          {/* Mount bracket */}
          <path d="M35 45 L35 62 L55 62" strokeWidth="8" />
          {/* Red/Blue status LED dot */}
          <circle cx="98" cy="18" r="3" fill="#FF3B30" stroke="none" />
        </g>

        {/* 2. TOP RIGHT: Ventilation & HVAC Fan Impeller (2 o'clock) */}
        <g transform="translate(262, 105)" fill="none" stroke={navyColor} strokeWidth="8">
          {/* Circular duct */}
          <circle cx="35" cy="35" r="30" strokeWidth="7" />
          {/* 3 Curved Fan Blades */}
          <path d="M35 35 C35 15, 52 12, 55 20 C57 26, 48 33, 35 35 Z" fill={navyColor} />
          <path d="M35 35 C52 42, 53 58, 45 60 C38 61, 34 50, 35 35 Z" fill={navyColor} />
          <path d="M35 35 C18 42, 12 28, 20 22 C26 18, 32 26, 35 35 Z" fill={navyColor} />
          {/* Center hub */}
          <circle cx="35" cy="35" r="7" fill={cyanColor} stroke={cyanColor} />
        </g>

        {/* 3. BOTTOM RIGHT: Plumbing Pipeline, Valve & Droplet (4 o'clock) */}
        <g transform="translate(255, 220)" fill="none" stroke={navyColor} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
          {/* Pipe Elbow & Flange */}
          <path d="M15 15 H50 V65 H75" strokeWidth="10" />
          {/* Valve handle */}
          <path d="M50 35 H65" stroke={cyanColor} strokeWidth="6" />
          <path d="M65 25 V45" stroke={cyanColor} strokeWidth="7" />
          {/* Water droplet */}
          <path d="M75 75 C75 75, 83 85, 83 91 C83 96, 79 100, 75 100 C71 100, 67 96, 67 91 C67 85, 75 75, 75 75 Z" fill={cyanColor} stroke={cyanColor} strokeWidth="3" />
        </g>

        {/* 4. BOTTOM: Fire Safety Shield & Flame (6 o'clock) */}
        <g transform="translate(160, 275)" fill="none" stroke={navyColor} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
          {/* Shield outline */}
          <path d="M20 15 H60 V45 C60 62, 40 75, 40 75 C40 75, 20 62, 20 45 Z" fill={navyColor} fillOpacity="0.08" strokeWidth="8" />
          {/* Fire Flame inside */}
          <path d="M40 30 C45 38, 48 44, 46 52 C44 58, 36 60, 36 60 C36 60, 33 54, 35 48 C36 44, 38 40, 40 30 Z" fill={cyanColor} stroke={cyanColor} strokeWidth="4" />
        </g>

        {/* 5. BOTTOM LEFT: Coiled Electrical / Data Cables (8 o'clock) */}
        <g transform="translate(65, 205)" fill="none" stroke={navyColor} strokeWidth="9" strokeLinecap="round">
          {/* Cable Loops */}
          <path d="M20 40 C15 25, 40 10, 65 22 C90 34, 75 65, 45 65 C25 65, 18 52, 25 38" strokeWidth="8" />
          <path d="M15 50 C10 35, 35 20, 60 32" strokeWidth="8" />
          {/* Stripped Wire Conductors */}
          <path d="M65 22 L85 15" stroke={cyanColor} strokeWidth="6" />
          <path d="M68 28 L88 24" stroke={cyanColor} strokeWidth="6" />
          <path d="M64 36 L84 35" stroke={cyanColor} strokeWidth="6" />
        </g>

        {/* 6. TOP LEFT: Sound Horn / Alarm Speaker with Acoustic Waves (10 o'clock) */}
        <g transform="translate(68, 105)" fill="none" stroke={navyColor} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
          {/* Speaker body */}
          <path d="M20 28 H32 L48 15 V55 L32 42 H20 Z" fill={navyColor} />
          {/* Acoustic sound waves */}
          <path d="M56 24 C62 30, 62 40, 56 46" stroke={cyanColor} strokeWidth="6" />
          <path d="M65 16 C76 26, 76 44, 65 54" stroke={cyanColor} strokeWidth="6" />
        </g>

        {/* CENTER: High-Energy Electric Lightning Bolt (Energy & Automation) */}
        <g filter="url(#glowEffect)">
          <path
            d="M216 115 L148 215 H196 L178 300 L254 195 H204 L216 115 Z"
            fill="url(#cyanGlowGrad)"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    );
  };

  // Typography Wordmark: "СК-КИТ" / "КИТ" + Tagline
  const renderTypography = () => {
    if (brandText === 'SKKit' || brandText === 'СК-КИТ') {
      return (
        <div className="flex flex-col justify-center select-none leading-none">
          <div className="flex items-baseline tracking-tight font-black" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <span
              className="text-[20px] sm:text-[24px] font-black tracking-tight"
              style={{ color: navyColor, letterSpacing: '-0.02em' }}
            >
              СК-
            </span>
            <span
              className="text-[20px] sm:text-[24px] font-black tracking-tight"
              style={{ color: cyanColor, letterSpacing: '-0.02em' }}
            >
              КИТ
            </span>
            {variant === 'horizontal' && (
              <span className="ml-2 pl-2 border-l border-neutral-300 dark:border-neutral-700 flex flex-col justify-center">
                <span className="text-[10px] sm:text-[11px] font-bold tracking-tight uppercase leading-tight" style={{ color: navyColor }}>
                  СТРОИТЕЛЬНЫЙ КОНТРОЛЬ
                </span>
                <span className="text-[8px] sm:text-[9px] font-medium text-neutral-500 uppercase tracking-wider hidden sm:block">
                  ЕИС Объекта
                </span>
              </span>
            )}
          </div>
          {variant !== 'horizontal' && showSubtitle && (
            <div
              className="text-[8px] sm:text-[9px] font-bold tracking-[0.1em] uppercase mt-0.5"
              style={{ color: subtitleColor }}
            >
              СТРОИТЕЛЬНЫЙ КОНТРОЛЬ
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col justify-center select-none">
        {/* Main Brand Acronym "КИТ" */}
        <div className="flex items-baseline tracking-tight font-black leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {/* Letter 'К' */}
          <span
            className="text-[28px] sm:text-[34px] font-black tracking-tighter"
            style={{ color: navyColor, letterSpacing: '-0.04em' }}
          >
            К
          </span>

          {/* Letter 'И' with cyan left leg */}
          <span className="relative inline-flex text-[28px] sm:text-[34px] font-black tracking-tighter ml-[1px]">
            <span style={{ color: cyanColor }}>И</span>
          </span>

          {/* Letter 'Т' with cyan accent slash */}
          <span className="relative inline-flex text-[28px] sm:text-[34px] font-black tracking-tighter ml-[1px]">
            <span style={{ color: navyColor }}>Т</span>
            <span
              className="absolute -top-[1px] -right-[5px] w-[6px] h-[6px] rotate-45"
              style={{ backgroundColor: cyanColor }}
            />
          </span>

          {variant === 'horizontal' && (
            <span className="ml-2.5 pl-2.5 border-l border-neutral-300 dark:border-neutral-700 flex flex-col justify-center">
              <span className="text-[11px] sm:text-[13px] font-bold tracking-tight uppercase leading-tight" style={{ color: navyColor }}>
                СТРОИТЕЛЬНЫЙ КОНТРОЛЬ
              </span>
              <span className="text-[8px] sm:text-[9px] font-semibold text-neutral-500 uppercase tracking-wider hidden sm:block">
                Единая Информационная Система
              </span>
            </span>
          )}
        </div>

        {/* Subtitle Slogan: "КОМПЛЕКСНЫЕ ИНЖЕНЕРНЫЕ ТЕХНОЛОГИИ" (only in full variant on desktop) */}
        {(variant === 'full' && showSubtitle) && (
          <div
            className="text-[8.5px] font-bold tracking-[0.16em] uppercase mt-1 opacity-90 truncate max-w-[280px] hidden md:block"
            style={{ color: subtitleColor }}
          >
            {BRAND_CONFIG.tagline}
          </div>
        )}
      </div>
    );
  };

  // Sizing container calculations
  const badgePx = 42 * scale;

  if (variant === 'symbol-only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} onClick={onClick}>
        {renderBadgeSymbol(badgePx)}
      </div>
    );
  }

  if (variant === 'wordmark-only') {
    return (
      <div className={`inline-flex items-center ${className}`} onClick={onClick}>
        {renderTypography()}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-3 cursor-pointer ${className}`}
      onClick={onClick}
      style={{ transformOrigin: 'left center' }}
    >
      {renderBadgeSymbol(badgePx)}
      {renderTypography()}
    </div>
  );
};
