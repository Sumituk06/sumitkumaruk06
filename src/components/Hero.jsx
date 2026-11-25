import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Download, FileText, Smartphone, Terminal } from 'lucide-react';
import { PROFILE, SOCIALS } from '../data/portfolioData';

export default function Hero({ onOpenResume }) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayRole, setDisplayRole] = useState(PROFILE.roles[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  const cardRef = useRef(null);

  // Typewriter role cycler that never leaves the line completely blank
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplayRole(PROFILE.roles[0]);
      return;
    }

    const currentFull = PROFILE.roles[roleIndex];
    let delay = isDeleting ? 34 : 68;

    if (!isDeleting && displayRole === currentFull) {
      delay = 2000;
    } else if (isDeleting && displayRole.length <= 1) {
      delay = 140;
    }

    const timer = setTimeout(() => {
      if (!isDeleting && displayRole === currentFull) {
        setIsDeleting(true);
      } else if (isDeleting && displayRole.length <= 1) {
        const nextIdx = (roleIndex + 1) % PROFILE.roles.length;
        setIsDeleting(false);
        setRoleIndex(nextIdx);
        setDisplayRole(PROFILE.roles[nextIdx].slice(0, 1));
      } else if (isDeleting) {
        setDisplayRole((prev) => prev.slice(0, -1));
      } else {
        setDisplayRole(currentFull.slice(0, displayRole.length + 1));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [displayRole, isDeleting, roleIndex]);

  // 3D pointer tilt on profile card
  const handleCardMove = (e) => {
    const card = cardRef.current;
    if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = (x / rect.width - 0.5) * 10;
    const rotateX = (y / rect.height - 0.5) * -10;
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
    <header className="hero" id="home">
      <div className="hero-left">
        <div className="availability-pill">
          <span className="pulse-dot" aria-hidden="true" />
          <span>{PROFILE.badge}</span>
        </div>

        <p className="hero-greeting">
          <Terminal size={16} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 8, color: 'var(--accent)' }} />
          Hi, I&apos;m {PROFILE.name}
        </p>

        <h1 className="hero-title">
          Building Modern
          <span className="hero-role-line">
            <span className="hero-role-prompt" aria-hidden="true">&gt;_ </span>
            <span className="hero-role-text">{displayRole}</span>
            <span className="typing-cursor" aria-hidden="true">|</span>
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

          <a href={PROFILE.apk.href} download className="btn btn-tertiary">
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

          <div className="ide-topbar" aria-hidden="true">
            <div className="ide-dots">
              <span className="ide-dot red" />
              <span className="ide-dot yellow" />
              <span className="ide-dot green" />
            </div>
            <span className="ide-filename">sumit.profile.tsx</span>
          </div>

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
