import { useEffect, useRef } from 'react';

const CODE_LINES = [
  [
    { t: 'const ', c: 'violet' },
    { t: 'sumit', c: 'cyan' },
    { t: ' = ', c: 'muted' },
    { t: 'useDeveloper', c: 'sky' },
    { t: "({ stack: ['React', 'TS', 'AI'] });", c: 'gold' },
  ],
  [
    { t: 'export default ', c: 'violet' },
    { t: 'function ', c: 'sky' },
    { t: 'Portfolio', c: 'cyan' },
    { t: '() { return <Studio theme="cyber" />; }', c: 'muted' },
  ],
  [
    { t: 'async function ', c: 'violet' },
    { t: 'askGemini', c: 'cyan' },
    { t: '(prompt: string) ', c: 'sky' },
    { t: '=> await ai.generate(prompt);', c: 'gold' },
  ],
  [
    { t: 'useEffect', c: 'sky' },
    { t: '(() => { ', c: 'muted' },
    { t: 'animateCircuit', c: 'cyan' },
    { t: '(canvas); ', c: 'muted' },
    { t: '}, [isVisible]);', c: 'violet' },
  ],
  [
    { t: '$ git ', c: 'gold' },
    { t: 'commit -m ', c: 'cyan' },
    { t: '"feat: interactive React UI + 3D cyber canvas"', c: 'muted' },
  ],
  [
    { t: 'interface ', c: 'violet' },
    { t: 'Project ', c: 'cyan' },
    { t: '{ title: ', c: 'muted' },
    { t: 'string', c: 'sky' },
    { t: '; liveUrl: ', c: 'muted' },
    { t: 'URL', c: 'gold' },
    { t: '; }', c: 'muted' },
  ],
  [
    { t: 'npm run ', c: 'gold' },
    { t: 'build ', c: 'cyan' },
    { t: '// ✓ 1646 modules transformed in 1.01s', c: 'muted' },
  ],
  [
    { t: '<dialog ', c: 'sky' },
    { t: 'closedby=', c: 'violet' },
    { t: '"any"', c: 'gold' },
    { t: ' className="app-dialog" />', c: 'cyan' },
  ],
  [
    { t: 'const ', c: 'violet' },
    { t: '[skills, setFilter]', c: 'cyan' },
    { t: ' = ', c: 'muted' },
    { t: 'useState', c: 'sky' },
    { t: "('frontend');", c: 'gold' },
  ],
  [
    { t: 'fetch', c: 'sky' },
    { t: "('https://api.github.com/users/Sumituk06')", c: 'gold' },
    { t: '.then(r => r.json());', c: 'cyan' },
  ],
];

const MATRIX_GLYPHS = ['0', '1', '{', '}', '<', '>', '/', '=', ';', '(', ')', '[', ']', '*', '+', '&'];

function makeStar(w, h) {
  const z = 0.25 + Math.random() * 0.75;
  return {
    x: Math.random() * w,
    y: Math.random() * h * 0.75,
    z,
    vx: (Math.random() - 0.5) * 0.25 * z,
    vy: (Math.random() - 0.5) * 0.18 * z,
    r: 0.9 + z * 1.4,
    twinkle: Math.random() * Math.PI * 2,
  };
}

function makeMovingCodeLine(w, h, index, total) {
  const z = 0.4 + (index % 3) * 0.28; // depth layer
  const dir = index % 2 === 0 ? 1 : -1;
  const laneY = ((index + 0.6) / total) * (h * 0.84);
  return {
    tokens: CODE_LINES[index % CODE_LINES.length],
    x: Math.random() * w,
    y: laneY,
    z,
    speed: dir * (0.35 + z * 0.55),
    fontSize: Math.round(11 + z * 3),
    alpha: 0.14 + z * 0.16,
  };
}

function makeRainColumn(x, h) {
  const len = 6 + Math.floor(Math.random() * 8);
  return {
    x,
    y: Math.random() * h,
    speed: 0.9 + Math.random() * 1.4,
    chars: Array.from({ length: len }, () => MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)]),
    tick: 0,
  };
}

function getTokenRGBA(colorName, alpha, isDark) {
  if (isDark) {
    switch (colorName) {
      case 'cyan':
        return `rgba(19, 224, 209, ${alpha})`;
      case 'violet':
        return `rgba(167, 139, 250, ${alpha})`;
      case 'sky':
        return `rgba(56, 189, 248, ${alpha})`;
      case 'gold':
        return `rgba(255, 200, 87, ${alpha})`;
      default:
        return `rgba(203, 213, 225, ${alpha * 0.8})`;
    }
  }
  switch (colorName) {
    case 'cyan':
      return `rgba(2, 122, 117, ${alpha * 0.95})`;
    case 'violet':
      return `rgba(79, 70, 229, ${alpha * 0.95})`;
    case 'sky':
      return `rgba(3, 105, 161, ${alpha * 0.95})`;
    case 'gold':
      return `rgba(180, 83, 9, ${alpha * 0.95})`;
    default:
      return `rgba(51, 65, 85, ${alpha * 0.8})`;
  }
}

export default function CoderBackground({ resolvedScheme }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const schemeRef = useRef(resolvedScheme);
  const pointerRef = useRef({ x: 0.5, y: 0.35, px: -999, py: -999, targetX: 0.5, targetY: 0.35 });

  useEffect(() => {
    schemeRef.current = resolvedScheme;
  }, [resolvedScheme]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onMove = (e) => {
      const nx = e.clientX / Math.max(window.innerWidth, 1);
      const ny = e.clientY / Math.max(window.innerHeight, 1);
      pointerRef.current.targetX = nx;
      pointerRef.current.targetY = ny;
      pointerRef.current.px = e.clientX;
      pointerRef.current.py = e.clientY;
      el.style.setProperty('--cx', `${e.clientX}px`);
      el.style.setProperty('--cy', `${e.clientY}px`);
    };

    const onLeave = () => {
      pointerRef.current.px = -999;
      pointerRef.current.py = -999;
      pointerRef.current.targetX = 0.5;
      pointerRef.current.targetY = 0.35;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animId = null;
    let isVisible = !document.hidden;
    let stars = [];
    let codeLines = [];
    let rainCols = [];
    let gridOffset = 0;

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const starCount = w < 640 ? 24 : 46;
      stars = Array.from({ length: starCount }, () => makeStar(w, h));

      const lineCount = w < 640 ? 8 : 14;
      codeLines = Array.from({ length: lineCount }, (_, idx) =>
        makeMovingCodeLine(w, h, idx, lineCount)
      );

      const colSpacing = w < 640 ? 90 : 120;
      const colCount = Math.max(5, Math.floor(w / colSpacing));
      rainCols = Array.from({ length: colCount }, (_, i) =>
        makeRainColumn(i * colSpacing + 28, h)
      );
    };

    const renderFrame = (animate) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isDark = schemeRef.current === 'dark';

      const ptr = pointerRef.current;
      ptr.x += (ptr.targetX - ptr.x) * 0.06;
      ptr.y += (ptr.targetY - ptr.y) * 0.06;

      ctx.clearRect(0, 0, w, h);

      // 1. 3D Perspective Cyber-Grid Floor
      const horizonY = h * (0.62 + (ptr.y - 0.5) * 0.03);
      const vanishX = w * (0.5 + (ptr.x - 0.5) * 0.12);
      const floorHeight = h - horizonY;
      const rayCount = w < 640 ? 12 : 22;
      const spread = w * 1.45;

      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(w, horizonY);
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.28)' : 'rgba(2, 122, 117, 0.18)';
      ctx.lineWidth = 1.1;
      ctx.stroke();

      ctx.lineWidth = 1;
      for (let i = -rayCount / 2; i <= rayCount / 2; i += 1) {
        const bottomX = vanishX + (i / (rayCount / 2)) * spread;
        const grad = ctx.createLinearGradient(vanishX, horizonY, bottomX, h);
        grad.addColorStop(0, isDark ? 'rgba(19, 224, 209, 0.03)' : 'rgba(2, 122, 117, 0.02)');
        grad.addColorStop(0.55, isDark ? 'rgba(56, 189, 248, 0.14)' : 'rgba(2, 122, 117, 0.09)');
        grad.addColorStop(1, isDark ? 'rgba(139, 92, 246, 0.22)' : 'rgba(79, 70, 229, 0.12)');
        ctx.beginPath();
        ctx.moveTo(vanishX, horizonY);
        ctx.lineTo(bottomX, h);
        ctx.strokeStyle = grad;
        ctx.stroke();
      }

      if (animate) {
        gridOffset = (gridOffset + 0.004) % 1;
      }
      const latLines = 10;
      for (let j = 0; j < latLines; j += 1) {
        const t = ((j / latLines) + (gridOffset / latLines) * 2.5) % 1;
        const depthY = horizonY + Math.pow(t, 2.3) * floorHeight;
        const alpha = Math.pow(t, 1.3) * (isDark ? 0.24 : 0.13);
        ctx.beginPath();
        ctx.moveTo(0, depthY);
        ctx.lineTo(w, depthY);
        ctx.strokeStyle = isDark
          ? `rgba(19, 224, 209, ${alpha})`
          : `rgba(2, 122, 117, ${alpha})`;
        ctx.stroke();
      }

      // 2. Vertical Matrix/Syntax Code Rain Columns
      ctx.font = '600 12px "JetBrains Mono", monospace';
      for (const col of rainCols) {
        if (animate) {
          col.y += col.speed;
          col.tick += 1;
          if (col.tick % 12 === 0) {
            const idx = Math.floor(Math.random() * col.chars.length);
            col.chars[idx] = MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)];
          }
          if (col.y - col.chars.length * 18 > h) {
            col.y = -20;
          }
        }

        for (let k = 0; k < col.chars.length; k += 1) {
          const cy = col.y - k * 18;
          if (cy < -20 || cy > h + 20) continue;
          const isHead = k === 0;
          const fade = (1 - k / col.chars.length) * (isDark ? 0.24 : 0.15);
          ctx.fillStyle = isHead
            ? isDark
              ? 'rgba(19, 224, 209, 0.45)'
              : 'rgba(2, 122, 117, 0.3)'
            : isDark
              ? `rgba(56, 189, 248, ${fade})`
              : `rgba(79, 70, 229, ${fade})`;
          ctx.fillText(col.chars[k], col.x, cy);
        }
      }

      // 3. Moving Syntax-Highlighted Real Code Lines (Parallax Streams)
      const camX = (ptr.x - 0.5) * -26;
      const camY = (ptr.y - 0.5) * -14;

      for (const line of codeLines) {
        ctx.font = `500 ${line.fontSize}px "JetBrains Mono", monospace`;

        // Measure total line width for seamless wrapping
        let totalWidth = 0;
        for (const tok of line.tokens) {
          totalWidth += ctx.measureText(tok.t).width;
        }

        if (animate) {
          line.x += line.speed;
          if (line.speed > 0 && line.x > w + 40) {
            line.x = -totalWidth - 40;
          } else if (line.speed < 0 && line.x + totalWidth < -40) {
            line.x = w + 40;
          }
        }

        let drawX = line.x + camX * line.z;
        const drawY = line.y + camY * line.z;

        // Brighten code lines slightly near pointer
        let boost = 1;
        if (ptr.py > -50 && Math.abs(drawY - ptr.py) < 120) {
          boost = 1.45;
        }

        for (const tok of line.tokens) {
          ctx.fillStyle = getTokenRGBA(tok.c, Math.min(0.45, line.alpha * boost), isDark);
          ctx.fillText(tok.t, drawX, drawY);
          drawX += ctx.measureText(tok.t).width;
        }
      }

      // 4. Interactive Star Nodes & Cursor Filaments
      const projected = stars.map((s) => {
        if (animate) {
          s.x += s.vx;
          s.y += s.vy;
          s.twinkle += 0.035;
          if (s.x < -20) s.x = w + 20;
          if (s.x > w + 20) s.x = -20;
          if (s.y < -20) s.y = h * 0.75;
          if (s.y > h * 0.75 + 20) s.y = -20;
        }
        return {
          s,
          px: s.x + camX * s.z,
          py: s.y + camY * s.z,
        };
      });

      for (let i = 0; i < projected.length; i += 1) {
        const a = projected[i];
        if (ptr.px > -50 && ptr.py > -50) {
          const pDist = Math.hypot(a.px - ptr.px, a.py - ptr.py);
          if (pDist < 175) {
            const pAlpha = (1 - pDist / 175) * (isDark ? 0.45 : 0.28);
            ctx.beginPath();
            ctx.moveTo(a.px, a.py);
            ctx.lineTo(ptr.px, ptr.py);
            ctx.strokeStyle = isDark
              ? `rgba(19, 224, 209, ${pAlpha})`
              : `rgba(79, 70, 229, ${pAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        const pulse = 0.65 + Math.sin(a.s.twinkle) * 0.35;
        ctx.beginPath();
        ctx.arc(a.px, a.py, a.s.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(19, 224, 209, ${(0.25 + a.s.z * 0.45) * pulse})`
          : `rgba(2, 122, 117, ${(0.18 + a.s.z * 0.3) * pulse})`;
        ctx.fill();
      }

      if (animate && isVisible) {
        animId = requestAnimationFrame(() => renderFrame(true));
      }
    };

    setup();

    if (prefersReduced) {
      renderFrame(false);
    } else {
      animId = requestAnimationFrame(() => renderFrame(true));
    }

    const onVisibility = () => {
      isVisible = !document.hidden;
      if (prefersReduced) return;
      if (isVisible && animId === null) {
        animId = requestAnimationFrame(() => renderFrame(true));
      } else if (!isVisible && animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    const onContentVis = (e) => {
      if (prefersReduced) return;
      isVisible = !e.skipped && !document.hidden;
      if (isVisible && animId === null) {
        animId = requestAnimationFrame(() => renderFrame(true));
      } else if (!isVisible && animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    const onResize = () => {
      setup();
      if (prefersReduced) renderFrame(false);
    };

    document.addEventListener('visibilitychange', onVisibility);
    container.addEventListener('contentvisibilityautostatechange', onContentVis);
    window.addEventListener('resize', onResize);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      container.removeEventListener('contentvisibilityautostatechange', onContentVis);
      window.removeEventListener('resize', onResize);
      if (animId !== null) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div ref={containerRef} className="coder-bg" aria-hidden="true">
      <div className="bg-aurora-layer" />
      <div className="bg-aurora-ribbon" />
      <div className="bg-cursor-glow" />
      <canvas ref={canvasRef} className="coder-canvas" />
      <div className="bg-vignette" />
    </div>
  );
}
