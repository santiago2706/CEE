/**
 * SVG Clay 3D de Ceci — Gradientes radiales, volumen, animaciones integradas.
 * Inspirado en el widget standalone bot-cee-supabase.
 */
export function CeciDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <radialGradient id="cClayHead" cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#d65a72" />
          <stop offset="45%" stopColor="#9b2437" />
          <stop offset="100%" stopColor="#5a1520" />
        </radialGradient>
        <radialGradient id="cClayBody" cx="40%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#a82a40" />
          <stop offset="55%" stopColor="#7B1E2E" />
          <stop offset="100%" stopColor="#4d1119" />
        </radialGradient>
        <radialGradient id="cClayGold" cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#f4d68a" />
          <stop offset="50%" stopColor="#C9972C" />
          <stop offset="100%" stopColor="#9a7016" />
        </radialGradient>
        <radialGradient id="cClayFace" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#2b3a4a" />
          <stop offset="100%" stopColor="#16212d" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** Ceci compacto (cabeza) — para FAB y header */
export function CeciCompact() {
  return (
    <svg
      viewBox="0 0 40 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="ceci-avatar-svg"
    >
      <ellipse className="cee-shadow" cx="20" cy="41" rx="11" ry="2.5" fill="rgba(40,10,16,0.28)" />
      <g className="cee-antenna">
        <line x1="20" y1="9" x2="20" y2="4" stroke="url(#cClayGold)" strokeWidth="2.2" strokeLinecap="round" />
        <circle className="cee-antenna-dot" cx="20" cy="3.5" r="2.6" fill="url(#cClayGold)" />
        <circle cx="19.3" cy="2.8" r="1" fill="#fff6d8" opacity="0.9" />
      </g>
      <rect x="4.5" y="9" width="31" height="26" rx="13" fill="url(#cClayHead)" />
      <ellipse cx="14" cy="16" rx="7" ry="5" fill="#ffffff" opacity="0.16" />
      <circle cx="5" cy="22" r="3.2" fill="url(#cClayGold)" />
      <circle cx="35" cy="22" r="3.2" fill="url(#cClayGold)" />
      <rect x="9" y="14.5" width="22" height="15" rx="7.5" fill="url(#cClayFace)" />
      <ellipse cx="20" cy="17" rx="9" ry="3" fill="#ffffff" opacity="0.08" />
      <ellipse className="cee-cheek" cx="11.5" cy="26" rx="2.6" ry="1.6" fill="#ff8fa3" opacity="0.5" />
      <ellipse className="cee-cheek" cx="28.5" cy="26" rx="2.6" ry="1.6" fill="#ff8fa3" opacity="0.5" />
      <g className="cee-eye-l">
        <circle cx="15.5" cy="22" r="2.9" fill="#9fe8ff" />
        <circle className="cee-eye-shine" cx="16.4" cy="21" r="1" fill="#fff" />
      </g>
      <g className="cee-eye-r">
        <circle cx="24.5" cy="22" r="2.9" fill="#9fe8ff" />
        <circle className="cee-eye-shine" cx="25.4" cy="21" r="1" fill="#fff" />
      </g>
      <path className="cee-mouth" d="M16.5 26 Q20 28.5 23.5 26" stroke="#9fe8ff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Ceci cuerpo completo — para la bienvenida (hero) */
export function CeciFullBody() {
  return (
    <svg
      viewBox="0 0 120 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cee-hero-svg"
      aria-hidden="true"
    >
      <ellipse className="cee-hero-shadow" cx="60" cy="122" rx="30" ry="6" fill="rgba(40,10,16,0.20)" />
      <g className="cee-hero-float">
        <g className="cee-antenna" style={{ transformOrigin: '60px 26px' }}>
          <line x1="60" y1="26" x2="60" y2="13" stroke="url(#cClayGold)" strokeWidth="3.5" strokeLinecap="round" />
          <circle className="cee-antenna-dot" cx="60" cy="10" r="5" fill="url(#cClayGold)" />
          <circle cx="58" cy="8" r="1.8" fill="#fff6d8" opacity="0.9" />
        </g>
        <rect x="38" y="74" width="44" height="40" rx="20" fill="url(#cClayBody)" />
        <ellipse cx="52" cy="84" rx="12" ry="7" fill="#ffffff" opacity="0.12" />
        <circle cx="60" cy="93" r="11" fill="url(#cClayGold)" />
        <circle cx="60" cy="93" r="11" fill="none" stroke="#fff6d8" strokeWidth="1" opacity="0.4" />
        <text x="60" y="97" textAnchor="middle" fontFamily="Segoe UI, sans-serif" fontSize="9" fontWeight="800" fill="#5a1520">CEE</text>
        <g style={{ transformOrigin: '40px 84px' }}>
          <rect x="26" y="82" width="16" height="9" rx="4.5" fill="url(#cClayBody)" />
          <circle cx="28" cy="86.5" r="5.5" fill="url(#cClayGold)" />
        </g>
        <g className="cee-hero-wave" style={{ transformOrigin: '82px 80px' }}>
          <rect x="80" y="62" width="9" height="22" rx="4.5" fill="url(#cClayBody)" transform="rotate(20 84 73)" />
          <circle cx="92" cy="58" r="6" fill="url(#cClayGold)" />
          <circle cx="90" cy="56" r="1.6" fill="#fff6d8" opacity="0.7" />
        </g>
        <rect x="30" y="30" width="60" height="50" rx="25" fill="url(#cClayHead)" />
        <ellipse cx="48" cy="44" rx="14" ry="10" fill="#ffffff" opacity="0.16" />
        <circle cx="31" cy="55" r="6.5" fill="url(#cClayGold)" />
        <circle cx="89" cy="55" r="6.5" fill="url(#cClayGold)" />
        <rect x="39" y="40" width="42" height="29" rx="14.5" fill="url(#cClayFace)" />
        <ellipse cx="60" cy="45" rx="17" ry="5" fill="#ffffff" opacity="0.08" />
        <ellipse className="cee-cheek" cx="44" cy="62" rx="5" ry="3" fill="#ff8fa3" opacity="0.5" />
        <ellipse className="cee-cheek" cx="76" cy="62" rx="5" ry="3" fill="#ff8fa3" opacity="0.5" />
        <g className="cee-eye-l" style={{ transformOrigin: '50px 54px' }}>
          <circle cx="50" cy="54" r="5.5" fill="#9fe8ff" />
          <circle className="cee-eye-shine" cx="52" cy="51.5" r="1.8" fill="#fff" />
        </g>
        <g className="cee-eye-r" style={{ transformOrigin: '70px 54px' }}>
          <circle cx="70" cy="54" r="5.5" fill="#9fe8ff" />
          <circle className="cee-eye-shine" cx="72" cy="51.5" r="1.8" fill="#fff" />
        </g>
        <path className="cee-mouth" d="M52 62 Q60 67 68 62" stroke="#9fe8ff" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}
