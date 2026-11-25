import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Download, FileText, Smartphone } from 'lucide-react';
import { PROFILE, SOCIALS } from '../data/portfolioData';

export default function Hero({ onOpenResume }) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayRole, setDisplayRole] = useState(PROFILE.roles[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const cardRef = useRef(null);

  // Typewriter role cycler (respects prefers-reduced-motion)
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplayRole(PROFILE.roles[0]);
      return;
    }

    const currentFull = PROFILE.roles[roleIndex];
    let delay = isDeleting ? 40 : 75;

    if (!isDeleting && displayRole === currentFull) {
      delay = 1900;
    } else if (isDeleting && displayRole === '') {
      delay = 320;
    }

    const timer = setTimeout(() => {
      if (!isDeleting && displayRole === currentFull) {
        setIsDeleting(true);
      } else if (isDeleting && displayRole === '') {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % PROFILE.roles.length);
      } else if (isDeleting) {
        setDisplayRole((prev) => prev.slice(0, -1));
      } else {
        setDisplayRole(currentFull.slice(0, displayRole.length + 1));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [displayRole, isDeleting, roleIndex]);

  // Subtle ambient particle canvas that pauses when off-screen (efficient-background-processing)
  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = null;
    let isVisible = true;
    let particles = [];

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const count = Math.min(34, Math.max(16, Math.floor(rect.width / 38)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.8,
      }));
    };

    const draw = () => {
      if (!isVisible) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(19, 224, 209, 0.45)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 115) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(19, 224, 209, ${(1 - dist / 115) * 0.14})`;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? false;
        if (isVisible && animId === null) {
          animId = requestAnimationFrame(draw);
        } else if (!isVisible && animId !== null) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(hero);

    window.addEventListener('resize', resize);
    animId = requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resize);
      if (animId !== null) cancelAnimationFrame(animId);
    };
  }, []);

  // 3D pointer tilt on profile card
  const handleCardMove = (e) => {
    const card = cardRef.current;
    if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 10;
    const rotateX = ((y / rect.height) - 0.5) * -10;
    card.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--my', `${(y / rect.height) * 100}%`);
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const resetCard = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    }
  };

  return (
    <header className="hero" id="home" ref={heroRef}>
      <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />

      <div className="hero-left">
        <div className="availability-pill">
          <span className="pulse-dot" aria-hidden="true" />
          <span>{PROFILE.badge}</span>
        </div>

        <p className="hero-greeting">Hi, I&apos;m {PROFILE.name}</p>
        <h1 className="hero-title">
          Building Modern
          <span className="hero-role-line">
            {displayRole}
            <span className="typing-cursor" aria-hidden="true">
              |
            </span>
          </span>
        </h1>

        <p className="hero-copy">{PROFILE.heroCopy}</p>

        <div className="hero-socials" aria-label="Social media links">
          {SOCIALS.map((social) => (
            <a
              key={social.id}
              href={social.href}
              target={social.id === 'mail' ? undefined : '_blank'}
              rel={social.id === 'mail' ? undefined : 'noopener noreferrer'}
              title={social.label}
              aria-label={social.label}
              className={`social-icon ${social.className}`}
            >
              <img src={social.icon} alt="" aria-hidden="true" width="20" height="20" />
            </a>
          ))}
        </div>

        <div className="hero-cta">
          <a href="#projects" className="btn btn-primary">
            <span>View Projects</span>
            <ArrowRight size={18} aria-hidden="true" />
          </a>

          <button type="button" onClick={onOpenResume} className="btn btn-secondary">
            <FileText size={18} aria-hidden="true" />
            <span>Preview &amp; Download CV</span>
          </button>

          <a
            href={PROFILE.apk.href}
            download
            className="btn btn-tertiary"
          >
            <Smartphone size={18} aria-hidden="true" />
            <span>Project APK</span>
            <Download size={16} aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="hero-right">
        <div
          ref={cardRef}
          className="profile-card"
          onMouseMove={handleCardMove}
          onMouseLeave={resetCard}
        >
          <div className="profile-card-glow" aria-hidden="true" />
          <div className="profile-image-wrapper">
            <img
              src="./front.jpeg"
              alt="Sumit Kumar portrait"
              className="profile-image"
              fetchPriority="high"
              width="192"
              height="192"
            />
          </div>
          <p className="profile-title">{PROFILE.brand}</p>
          <p className="profile-subtitle">React • UI/UX • AI Integration</p>
          <div className="mini-stats">
            <span>React &amp; TypeScript</span>
            <span>React Native</span>
            <span>Frontend UI/UX</span>
            <span>GitHub Workflow</span>
          </div>
        </div>
      </div>
    </header>
  );
}

