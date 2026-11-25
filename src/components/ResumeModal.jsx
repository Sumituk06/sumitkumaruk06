import { Download, FileText, X } from 'lucide-react';
import { PROFILE } from '../data/portfolioData';
import { useDialogModal } from '../hooks/useDialogModal';

export default function ResumeModal({ isOpen, onClose }) {
  const dialogRef = useDialogModal(isOpen, onClose);

  return (
    <dialog
      ref={dialogRef}
      className="app-dialog"
      closedby="any"
      aria-labelledby="resume-modal-title"
    >
      {isOpen && (
        <div className="dialog-inner">
          <div className="dialog-header">
            <div>
              <h1 className="dialog-title" id="resume-modal-title">
                Sumit Kumar — Resume
              </h1>
              <p className="section-subtitle">
                Preview ATS-friendly resume or download PNG / PDF directly.
              </p>
            </div>
            <button
              type="button"
              className="dialog-close-btn"
              onClick={onClose}
              aria-label="Close resume preview"
              autoFocus
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <img
            src={PROFILE.resumes.atsPng}
            alt="Sumit Kumar ATS Resume preview"
            className="dialog-resume-img"
            fetchPriority="low"
          />

          <div className="dialog-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              Close
            </button>
            <a
              href={PROFILE.resumes.proPng}
              download={PROFILE.resumes.downloadName}
              className="btn btn-ghost btn-sm"
            >
              <FileText size={15} aria-hidden="true" />
              Visual CV (PNG)
            </a>
            <a
              href={PROFILE.resumes.atsPng}
              download="Sumit_Kumar_ATS_Resume.png"
              className="btn btn-secondary btn-sm"
            >
              <Download size={15} aria-hidden="true" />
              ATS Resume (PNG)
            </a>
            <a
              href={PROFILE.resumes.atsPdf}
              download="Sumit_Kumar_Resume.pdf"
              className="btn btn-primary btn-sm"
            >
              <Download size={15} aria-hidden="true" />
              Download PDF
            </a>
          </div>
        </div>
      )}
    </dialog>
  );
}

