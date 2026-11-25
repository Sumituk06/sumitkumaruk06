import { useEffect, useRef } from 'react';

/**
 * Top scroll-progress bar.
 * Uses CSS `animation-timeline: scroll()` natively when supported,
 * and falls back to a passive scroll listener otherwise.
 */
export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const supportsScrollTimeline = CSS.supports('animation-timeline', 'scroll()');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (supportsScrollTimeline || prefersReduced) return;

    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      bar.style.transform = `scaleX(${ratio})`;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return <div ref={barRef} className="scroll-progress" aria-hidden="true" />;
}

