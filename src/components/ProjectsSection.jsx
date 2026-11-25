import { useCallback, useState } from 'react';
import { ExternalLink, Eye, Smartphone, X } from 'lucide-react';
import { PROJECTS } from '../data/portfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useDialogModal } from '../hooks/useDialogModal';

export default function ProjectsSection() {
  const { ref, visible } = useScrollReveal();
  const [selectedProject, setSelectedProject] = useState(null);

  const closeModal = useCallback(() => setSelectedProject(null), []);
  const dialogRef = useDialogModal(Boolean(selectedProject), closeModal);

  return (
    <section
      ref={ref}
      className={`section reveal-block ${visible ? 'is-visible' : ''}`}
      id="projects"
      aria-labelledby="projects-heading"
    >
      <div className="section-header">
        <div>
          <span className="section-kicker">// 03. Selected Work</span>
          <h2 className="section-title" id="projects-heading">
            Featured Projects
          </h2>
          <p className="section-subtitle">
            Real-world builds spanning responsive web portals, REST API utilities, and Android APK packaging.
          </p>
        </div>
      </div>

      <div className="projects-grid">
        {PROJECTS.map((project) => (
          <article className="project-card" key={project.id}>
            <div className="project-thumb-wrap">
              <img
                src={project.image}
                alt={project.alt}
                className="project-thumb"
                loading="lazy"
                width="640"
                height="360"
              />
              <span className="project-category-pill">{project.category}</span>
            </div>

            <div className="project-body">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-desc">{project.summary}</p>

              <div className="tech-tags">
                {project.tech.map((item) => (
                  <span className="tech-tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>

              <div className="project-actions">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  <ExternalLink size={15} aria-hidden="true" />
                  Live Demo
                </a>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSelectedProject(project)}
                >
                  <Eye size={15} aria-hidden="true" />
                  Inspect Details
                </button>

                {project.apkUrl && (
                  <a href={project.apkUrl} download className="btn btn-secondary btn-sm">
                    <Smartphone size={15} aria-hidden="true" />
                    APK
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Native <dialog closedby="any"> project detail modal */}
      <dialog
        ref={dialogRef}
        className="app-dialog"
        closedby="any"
        aria-labelledby="project-modal-title"
      >
        {selectedProject && (
          <div className="dialog-inner">
            <div className="dialog-header">
              <div>
                <h1 className="dialog-title" id="project-modal-title">
                  {selectedProject.title}
                </h1>
                <p className="section-subtitle">{selectedProject.tagline}</p>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={closeModal}
                aria-label="Close project details"
                autoFocus
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <img
              src={selectedProject.image}
              alt={selectedProject.alt}
              className="dialog-preview-img"
              fetchPriority="low"
            />

            <p>{selectedProject.summary}</p>

            <ul className="dialog-list">
              {selectedProject.highlights.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>

            <div className="tech-tags">
              {selectedProject.tech.map((item) => (
                <span className="tech-tag" key={item}>
                  {item}
                </span>
              ))}
            </div>

            <div className="dialog-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={closeModal}>
                Close
              </button>
              {selectedProject.apkUrl && (
                <a href={selectedProject.apkUrl} download className="btn btn-secondary btn-sm">
                  <Smartphone size={15} aria-hidden="true" />
                  Download APK
                </a>
              )}
              <a
                href={selectedProject.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                <ExternalLink size={15} aria-hidden="true" />
                Visit Live Site
              </a>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}

