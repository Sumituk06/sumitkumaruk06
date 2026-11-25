import { CheckCircle2, Cpu, GraduationCap, Settings } from 'lucide-react';
import {
  CS_FUNDAMENTALS,
  EDUCATION_TIMELINE,
  SPECIALIZATIONS,
} from '../data/portfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function EducationSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`section reveal-block ${visible ? 'is-visible' : ''}`}
      id="education"
      aria-labelledby="education-heading"
    >
      <div className="section-header">
        <div>
          <span className="section-kicker">// 04. Credentials</span>
          <h2 className="section-title" id="education-heading">
            Education &amp; Foundations
          </h2>
          <p className="section-subtitle">
            Academic qualifications, IIT Roorkee industrial certification, and core computer science fundamentals.
          </p>
        </div>
      </div>

      <div className="education-grid">
        <article className="education-card">
          <div className="edu-header">
            <span className="edu-icon-wrap" aria-hidden="true">
              <GraduationCap size={22} />
            </span>
            <h3>Academic Timeline</h3>
          </div>

          <div className="edu-timeline">
            {EDUCATION_TIMELINE.map((item) => (
              <div className="timeline-item" key={item.id}>
                <div
                  className={`timeline-dot ${item.accent === 'gold' ? 'gold' : ''}`}
                  aria-hidden="true"
                />
                <h4>{item.title}</h4>
                <p className="edu-institute">{item.institute}</p>
                <div className="edu-meta">
                  <span className="edu-date">{item.period}</span>
                  <span className="edu-grade">{item.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="education-card">
          <div className="edu-header">
            <span className="edu-icon-wrap" aria-hidden="true">
              <Cpu size={22} />
            </span>
            <h3>CS Fundamentals</h3>
          </div>

          <ul className="edu-list">
            {CS_FUNDAMENTALS.map((item) => (
              <li key={item.title}>
                <CheckCircle2 size={17} className="edu-check" aria-hidden="true" />
                <span>
                  <strong>{item.title}</strong> – {item.detail}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="education-card">
          <div className="edu-header">
            <span className="edu-icon-wrap" aria-hidden="true">
              <Settings size={22} />
            </span>
            <h3>Technical Specialization</h3>
          </div>

          <ul className="edu-list">
            {SPECIALIZATIONS.map((item) => (
              <li key={item.title}>
                <CheckCircle2 size={17} className="edu-check" aria-hidden="true" />
                <span>
                  <strong>{item.title}:</strong> {item.detail}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

