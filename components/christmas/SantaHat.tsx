// Small Father Christmas hat that sits on the top-left corner of the FroshX logo.
export default function SantaHat({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 62" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="xh-red" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#F0475A" />
          <stop offset="0.55" stopColor="#D3162F" />
          <stop offset="1" stopColor="#A10F25" />
        </linearGradient>
        <linearGradient id="xh-fur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E3EAF1" />
        </linearGradient>
        <radialGradient id="xh-pom" cx="0.38" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#DCE5EE" />
        </radialGradient>
      </defs>
      {/* hat body */}
      <path d="M9 44 C10 24 24 9 44 8 C54 7.5 62 12 65 21 C58 17 51 19 49 25 C48 33 52 40 59 45 Z" fill="url(#xh-red)" />
      {/* soft highlight */}
      <path d="M15 40 C16 27 25 16 38 13" fill="none" stroke="#FF8A98" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
      {/* fur brim */}
      <rect x="3" y="39" width="62" height="16" rx="8" fill="url(#xh-fur)" />
      <path d="M10 49.5 q4 -3 8 0 t8 0 t8 0 t8 0 t8 0" fill="none" stroke="#CBD6E2" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      {/* pom-pom */}
      <circle cx="64" cy="19" r="7.5" fill="url(#xh-pom)" />
      <circle cx="61.5" cy="16.5" r="2" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}
