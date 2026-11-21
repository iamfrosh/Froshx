// A small Christmas tree whose lights switch on one by one (used by the loader, footer and welcome screen).
const BULBS: [number, number, string][] = [
  [60, 46, "#FF5A5F"], [49, 70, "#FFD166"], [73, 72, "#7BE495"], [36, 98, "#FF5A5F"], [62, 94, "#FFFFFF"],
  [86, 100, "#FFD166"], [28, 124, "#7BE495"], [52, 120, "#FFD166"], [76, 124, "#FF5A5F"], [98, 122, "#FFFFFF"],
];

export default function ChristmasTree({ className = "", animate = true }: { className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 120 152" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="xt-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1F7A57" />
          <stop offset="1" stopColor="#0E4A35" />
        </linearGradient>
        <radialGradient id="xt-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFE08A" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFE08A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="54" y="132" width="12" height="15" rx="2" fill="#7A4B2A" />
      <g fill="url(#xt-g)" stroke="#0E4A35" strokeWidth="2" strokeLinejoin="round">
        <path d="M60 64 L108 134 L12 134 Z" />
        <path d="M60 40 L94 100 L26 100 Z" />
        <path d="M60 18 L82 64 L38 64 Z" />
      </g>
      {BULBS.map(([x, y, c], i) => (
        <circle key={i} cx={x} cy={y} r="4.2" fill={c} className={animate ? "xm-bulb-t" : ""} style={animate ? { animationDelay: `${0.15 + i * 0.13}s, ${1.9 + i * 0.2}s` } : undefined} />
      ))}
      <circle cx="60" cy="14" r="15" fill="url(#xt-glow)" className={animate ? "xm-star-glow" : ""} />
      <path d="M60 4 L63.4 11.6 L71.6 12.4 L65.4 17.8 L67.2 25.8 L60 21.6 L52.8 25.8 L54.6 17.8 L48.4 12.4 L56.6 11.6 Z" fill="#FFD25E" stroke="#F1A91B" strokeWidth="1" strokeLinejoin="round" className={animate ? "xm-star" : ""} />
    </svg>
  );
}
