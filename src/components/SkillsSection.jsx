import { useState } from 'react';
import { SKILL_CATEGORIES, SKILLS } from '../data/portfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function SkillsSection() {
  const [category, setCategory] = useState('all');
  const { ref, visible } = useScrollReveal();

  const filteredSkills =
    category === 'all' ? SKILLS : SKILLS.filter((skill) => skill.category === category);

  return (
    <section
      ref={ref}
      className={`section reveal-block ${visible ? 'is-visible' : ''}`}
      id="skills"
      aria-labelledby="skills-heading"
    >
      <div className="section-header">
        <div>
          <span className="section-kicker">// 02. Capabilities</span>
          <h2 className="section-title" id="skills-heading">
            Skills Stack
          </h2>
          <p className="section-subtitle">
            Technologies I use to build responsive web interfaces, mobile apps, and reliable developer workflows.
          </p>
        </div>

        <div className="filter-tabs" role="tablist" aria-label="Filter skills by category">
          {SKILL_CATEGORIES.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={category === tab.id}
              className={`filter-tab ${category === tab.id ? 'active' : ''}`}
              onClick={() => setCategory(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="skills-grid">
        {filteredSkills.map((skill) => {
          const isLearning = skill.status === 'Learning' || skill.status === 'Building';
          return (
            <article className="skill-card" key={skill.id}>
              <div className="skill-top">
                <div className="skill-icon-box">
                  {skill.icon ? (
                    <img
                      src={skill.icon}
                      alt={skill.name}
                      loading="lazy"
                      width="30"
                      height="30"
                    />
                  ) : (
                    <span
                      className="skill-badge-glyph"
                      style={{ color: skill.color }}
                      aria-hidden="true"
                    >
                      {skill.badgeText}
                    </span>
                  )}
                </div>

                <div className="skill-title-row">
                  <div className="skill-name-wrap">
                    <span className="skill-name">{skill.name}</span>
                    <span className={`skill-status ${isLearning ? 'learning' : ''}`}>
                      {skill.status}
                    </span>
                  </div>
                  <p className="skill-summary">{skill.summary}</p>
                </div>
              </div>

              <div className="skill-meter-row">
                <div className="skill-progress-bg" aria-hidden="true">
                  <div
                    className="skill-progress-fill"
                    style={{
                      width: visible ? `${skill.level}%` : '0%',
                      background: skill.gradient,
                      boxShadow: `0 0 12px ${skill.color}55`,
                    }}
                  />
                </div>
                <span className="skill-percentage">{skill.level}%</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

