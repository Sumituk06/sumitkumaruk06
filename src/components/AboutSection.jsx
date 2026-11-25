import { Sparkles, Layers, Cpu, Rocket } from 'lucide-react';
import { HIGHLIGHTS, PROFILE } from '../data/portfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function AboutSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`section reveal-block ${visible ? 'is-visible' : ''}`}
      id="about"
      aria-labelledby="about-heading"
    >
      <div className="section-header">
        <div>
          <span className="section-kicker">// 01. Introduction</span>
          <h2 className="section-title" id="about-heading">
            About Me
          </h2>
        </div>
      </div>

      <div className="bento-grid">
        <div className="bento-card">
          <p className="bento-lead">{PROFILE.aboutCopy}</p>
          <div className="focus-pills">
            <span className="focus-pill">
              <Sparkles size={15} aria-hidden="true" />
              Component-Driven React UI
            </span>
            <span className="focus-pill">
              <Layers size={15} aria-hidden="true" />
              Responsive Design Systems
            </span>
            <span className="focus-pill">
              <Cpu size={15} aria-hidden="true" />
              Gemini AI Integration
            </span>
            <span className="focus-pill">
              <Rocket size={15} aria-hidden="true" />
              Cross-Platform Mobile
            </span>
          </div>
        </div>

        <div className="highlights-grid">
          {HIGHLIGHTS.map((item) => (
            <div className="highlight-stat" key={item.label}>
              <div className="highlight-value">{item.value}</div>
              <div className="highlight-label">{item.label}</div>
              <div className="highlight-detail">{item.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

