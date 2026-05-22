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
        className="pointer-events-none absolute bottom-0 left-0 z-0 hidden h-[min(88vh,760px)] w-[min(54vw,460px)] sm:block"
        aria-hidden
        style={{
          backgroundImage: "url('/invitacion-karina.png')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left bottom',
          backgroundSize: 'auto 100%',
          filter: 'saturate(1.25) contrast(1.08) brightness(1.04)',
          WebkitMaskImage: 'linear-gradient(to right, black 0%, black 72%, transparent 96%)',
          maskImage: 'linear-gradient(to right, black 0%, black 72%, transparent 96%)',
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-[min(52vh,340px)] w-[min(58vw,260px)] sm:hidden"
        aria-hidden
        style={{
          backgroundImage: "url('/invitacion-karina.png')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left bottom',
          backgroundSize: 'auto 100%',
          filter: 'saturate(1.3) contrast(1.1) brightness(1.05)',
          WebkitMaskImage: 'linear-gradient(to right, black 0%, black 55%, transparent 88%)',
          maskImage: 'linear-gradient(to right, black 0%, black 55%, transparent 88%)',
        }}
      />

      {/* Velo suave: más transparente a la izquierda para ver a Karina */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden
        style={{
          background:
            'linear-gradient(105deg, transparent 0%, transparent 38%, rgba(245, 230, 211, 0.4) 50%, rgba(253, 245, 230, 0.85) 65%)',
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
