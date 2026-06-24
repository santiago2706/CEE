export function ScrollHint() {
  return (
    <a
      href="#eventos"
      aria-label="Desplázate hacia abajo"
      className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-white/80 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-safe:animate-bounce"
    >
      <span className="text-xs uppercase tracking-widest">Scroll</span>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
    </a>
  );
}
