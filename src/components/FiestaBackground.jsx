export default function FiestaBackground({ children }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-fiesta-cream text-fiesta-burgundy">
      {/* Textura acuarela */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 15% 10%, rgba(210, 170, 140, 0.35), transparent 60%),
            radial-gradient(ellipse 70% 45% at 85% 90%, rgba(200, 150, 130, 0.3), transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(245, 230, 211, 0.5), transparent 70%)
          `,
        }}
      />

      {/* Flores decorativas (esquinas) */}
      <div
        className="pointer-events-none absolute -left-8 -top-8 h-48 w-48 rounded-full opacity-40 blur-2xl"
        style={{ background: 'radial-gradient(circle, #B22222 0%, #800020 40%, transparent 70%)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -right-10 h-56 w-56 rounded-full opacity-35 blur-2xl"
        style={{ background: 'radial-gradient(circle, #DC143C 0%, #8B0000 45%, transparent 72%)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-0 h-40 w-40 opacity-25"
        aria-hidden
        style={{
          background: 'radial-gradient(ellipse at 100% 0%, rgba(178, 34, 34, 0.5) 0%, transparent 65%)',
        }}
      />

      {/* Invitación: Karina a la izquierda */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-0 hidden h-[min(85vh,720px)] w-[min(52vw,420px)] sm:block"
        aria-hidden
        style={{
          backgroundImage: "url('/invitacion-karina.png')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left bottom',
          backgroundSize: 'auto 100%',
          WebkitMaskImage:
            'linear-gradient(to right, black 0%, black 55%, transparent 92%), linear-gradient(to top, black 0%, black 88%, transparent 100%)',
          maskImage:
            'linear-gradient(to right, black 0%, black 55%, transparent 92%), linear-gradient(to top, black 0%, black 88%, transparent 100%)',
          WebkitMaskComposite: 'source-in',
          maskComposite: 'intersect',
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-[min(42vh,280px)] w-[min(48vw,200px)] opacity-60 sm:hidden"
        aria-hidden
        style={{
          backgroundImage: "url('/invitacion-karina.png')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left bottom',
          backgroundSize: 'auto 100%',
          WebkitMaskImage: 'linear-gradient(to right, black 35%, transparent 78%)',
          maskImage: 'linear-gradient(to right, black 35%, transparent 78%)',
        }}
      />

      {/* Velo suave para legibilidad del contenido */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden
        style={{
          background:
            'linear-gradient(105deg, transparent 0%, rgba(245, 230, 211, 0.15) 28%, rgba(245, 230, 211, 0.75) 48%, rgba(253, 245, 230, 0.92) 62%)',
        }}
      />

      {/* Marco fino como la invitación */}
      <div
        className="pointer-events-none absolute inset-3 z-[2] rounded-sm border border-fiesta-burgundy/35 sm:inset-4"
        aria-hidden
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
