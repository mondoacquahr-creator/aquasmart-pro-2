import { useEffect, useRef } from 'react';

export function WaterBackground() {
  const layerARef = useRef<HTMLDivElement>(null);
  const layerBRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    let ticking = false;
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(() => {
          const s = lastScrollY;
          const sc = Math.min(s, 2000);
          const scaleA = 1 + Math.min(s, 3000) * 0.00012;
          const scaleB = 1 + Math.min(s, 3000) * 0.00008;
          if (layerARef.current) {
            layerARef.current.style.transform = `translateY(${sc * -0.12}px) scale(${scaleA})`;
          }
          if (layerBRef.current) {
            layerBRef.current.style.transform = `translateY(${sc * -0.05}px) scale(${scaleB}) rotate(${sc * 0.002}deg)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes aqua-breathe {
            from { transform: scale(1); }
            to   { transform: scale(1.04); }
          }
          .aqua-breathe-wrap {
            animation: aqua-breathe 10s ease-in-out infinite alternate;
          }
        }
      `}</style>
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        <div className="aqua-breathe-wrap absolute inset-0">
          <div
            ref={layerARef}
            className="absolute"
            style={{
              top: '-60%',
              right: '-60%',
              bottom: '-60%',
              left: '-60%',
              backgroundImage:
                'repeating-radial-gradient(circle at 63% 39%, transparent 0px, transparent 55px, rgba(120,220,255,0.09) 55px, rgba(120,220,255,0.09) 56.5px)',
              willChange: 'transform',
            }}
          />
          <div
            ref={layerBRef}
            className="absolute"
            style={{
              top: '-60%',
              right: '-60%',
              bottom: '-60%',
              left: '-60%',
              backgroundImage:
                'repeating-radial-gradient(circle at 39% 62%, transparent 0px, transparent 83px, rgba(79,195,240,0.07) 83px, rgba(79,195,240,0.07) 84.5px)',
              willChange: 'transform',
            }}
          />
        </div>
      </div>
    </>
  );
}
