import { ArrowUp } from 'lucide-react';
import { PROFILE, SOCIALS } from '../data/portfolioData';

export default function Footer({ showTopButton }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="footer">
        <p className="footer-copy">
          © {new Date().getFullYear()} <strong>{PROFILE.name}</strong> • Crafted with React
        </p>

        <div className="footer-links">
          {SOCIALS.map((social) => (
            <a
              key={social.id}
              href={social.href}
              target={social.id === 'mail' ? undefined : '_blank'}
              rel={social.id === 'mail' ? undefined : 'noopener noreferrer'}
            >
              {social.label}
            </a>
          ))}
        </div>
      </footer>

      {showTopButton && (
        <button
          type="button"
          className="top-btn"
          onClick={scrollToTop}
          aria-label="Scroll back to top"
        >
          <ArrowUp size={20} aria-hidden="true" />
        </button>
      )}
    </>
  );
}

