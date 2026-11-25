import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Mail,
  MessageSquare,
  Send,
  Tag,
  User,
} from 'lucide-react';
import { PROFILE } from '../data/portfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function ContactSection() {
  const { ref, visible } = useScrollReveal();
  const formRef = useRef(null);
  const announcerRef = useRef(null);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text: string }

  // Sync aria-invalid, dynamic aria-describedby, and polite live announcer
  // + fallback classes when :user-invalid is unsupported (validate-input-after-interaction)
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const supportsUserInvalid = CSS.supports('selector(:user-invalid)');
    const dirtyState = new WeakMap();
    const flagged = new WeakSet();
    const announced = new WeakSet();
    let announceTimer = null;
    let announcedField = null;

    const linkError = (el, shown) => {
      const errorId = el.dataset.error;
      if (!errorId) return;
      const ids = (el.getAttribute('aria-describedby') || '')
        .split(/\s+/)
        .filter((id) => id && id !== errorId);
      if (shown) ids.push(errorId);
      if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
      else el.removeAttribute('aria-describedby');
    };

    const announceError = (el) => {
      const errorEl = document.getElementById(el.dataset.error);
      const announcer = announcerRef.current;
      if (!errorEl || !announcer) return;
      const label = el.labels?.[0]?.textContent?.trim();
      clearTimeout(announceTimer);
      announcer.textContent = '';
      announcedField = el;
      announceTimer = setTimeout(() => {
        announcer.textContent = `${label ? `${label}: ` : ''}${errorEl.textContent.trim()}`;
      }, 500);
    };

    const syncAria = (el, shouldAnnounce = false) => {
      if (!el?.matches?.('input, textarea')) return;

      let invalid;
      if (supportsUserInvalid) {
        invalid = el.matches(':user-invalid');
      } else {
        const st = dirtyState.get(el);
        invalid = Boolean(st?.hasBlurred && st?.hasInteracted && !el.validity.valid);
        el.classList.toggle('user-invalid-fallback', invalid);
        el.classList.toggle('user-valid-fallback', Boolean(st?.hasBlurred && el.validity.valid));
      }

      if (invalid) {
        if (shouldAnnounce && !announced.has(el)) {
          announceError(el);
          announced.add(el);
        }
        el.setAttribute('aria-invalid', 'true');
        linkError(el, true);
        flagged.add(el);
      } else if (flagged.has(el) || el.getAttribute('aria-invalid') !== 'true') {
        el.setAttribute('aria-invalid', 'false');
        linkError(el, false);
        flagged.delete(el);
        announced.delete(el);
        if (announcedField === el && announcerRef.current) {
          clearTimeout(announceTimer);
          announcerRef.current.textContent = '';
        }
      }
    };

    form.querySelectorAll('input, textarea').forEach((el) => {
      el.setAttribute('aria-invalid', 'false');
    });

    const onBlur = (e) => {
      const el = e.target;
      if (!supportsUserInvalid && el.matches?.('input, textarea')) {
        const st = dirtyState.get(el) || { hasInteracted: false, hasBlurred: false };
        st.hasBlurred = true;
        dirtyState.set(el, st);
      }
      syncAria(el, true);
    };

    const onInput = (e) => {
      const el = e.target;
      if (!supportsUserInvalid && el.matches?.('input, textarea')) {
        const st = dirtyState.get(el) || { hasInteracted: false, hasBlurred: false };
        st.hasInteracted = true;
        dirtyState.set(el, st);
      }
      if (el.hasAttribute('aria-invalid')) syncAria(el, false);
    };

    const onInvalid = (e) => {
      const el = e.target;
      if (!supportsUserInvalid) {
        dirtyState.set(el, { hasInteracted: true, hasBlurred: true });
      }
      announced.add(el);
      syncAria(el, false);
    };

    const onReset = () => {
      setTimeout(() => {
        form.querySelectorAll('input, textarea').forEach((el) => {
          dirtyState.delete(el);
          el.classList.remove('user-invalid-fallback', 'user-valid-fallback');
          syncAria(el, false);
        });
      });
    };

    form.addEventListener('blur', onBlur, true);
    form.addEventListener('input', onInput);
    form.addEventListener('invalid', onInvalid, true);
    form.addEventListener('reset', onReset);

    return () => {
      clearTimeout(announceTimer);
      form.removeEventListener('blur', onBlur, true);
      form.removeEventListener('input', onInput);
      form.removeEventListener('invalid', onInvalid, true);
      form.removeEventListener('reset', onReset);
    };
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 1800);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    if (!form.reportValidity()) return;

    setSubmitting(true);
    setStatus(null);

    try {
      const formData = new FormData(form);
      const response = await fetch('https://formspree.io/f/xqarvzko', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        form.reset();
        setStatus({
          type: 'success',
          text: 'Message sent successfully! Sumit will get back to you soon.',
        });
      } else {
        throw new Error('Submission failed');
      }
    } catch {
      setStatus({
        type: 'error',
        text: `Could not submit right now. Please email directly at ${PROFILE.email}.`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      ref={ref}
      className={`section reveal-block ${visible ? 'is-visible' : ''}`}
      id="contact"
      aria-labelledby="contact-heading"
    >
      <div ref={announcerRef} aria-live="polite" className="visually-hidden" />

      <div className="contact-layout">
        <div className="contact-left">
          <div>
            <span className="section-kicker">// 06. Get in Touch</span>
            <h2 className="section-title" id="contact-heading">
              Contact Me
            </h2>
            <p className="section-subtitle">
              Have an internship, freelance project, or collaboration idea? Let&apos;s connect.
            </p>
          </div>

          <img
            src="./image.png"
            alt="Sumit Kumar"
            className="contact-portrait"
            loading="lazy"
            width="360"
            height="360"
          />

          <div className="email-copy-card">
            <div className="email-copy-text">
              <span className="email-copy-label">Direct Email</span>
              <span className="email-copy-addr">{PROFILE.email}</span>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleCopyEmail}
              aria-label="Copy email address"
            >
              {copiedEmail ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="contactFormCard">
          <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="contact-name" className="field-label">
                Your Name
              </label>
              <span id="contact-name-hint" className="field-hint">
                Enter your full name
              </span>
              <div className="input-wrap">
                <User size={18} className="input-icon" aria-hidden="true" />
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Sumit Kumar"
                  className="form-control"
                  aria-describedby="contact-name-hint"
                  data-error="contact-name-error"
                />
              </div>
              <div id="contact-name-error" className="error-msg">
                <AlertCircle size={15} aria-hidden="true" />
                Please enter your name.
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="contact-email" className="field-label">
                Email Address
              </label>
              <span id="contact-email-hint" className="field-hint">
                Format: you@example.com
              </span>
              <div className="input-wrap">
                <Mail size={18} className="input-icon" aria-hidden="true" />
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="form-control"
                  aria-describedby="contact-email-hint"
                  data-error="contact-email-error"
                />
              </div>
              <div id="contact-email-error" className="error-msg">
                <AlertCircle size={15} aria-hidden="true" />
                Enter an email address in the format you@example.com.
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="contact-subject" className="field-label">
                Subject
              </label>
              <span id="contact-subject-hint" className="field-hint">
                Briefly describe your topic (e.g. Frontend Internship)
              </span>
              <div className="input-wrap">
                <Tag size={18} className="input-icon" aria-hidden="true" />
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  required
                  placeholder="Project / Internship Inquiry"
                  className="form-control"
                  aria-describedby="contact-subject-hint"
                  data-error="contact-subject-error"
                />
              </div>
              <div id="contact-subject-error" className="error-msg">
                <AlertCircle size={15} aria-hidden="true" />
                Please add a subject for your message.
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="contact-message" className="field-label">
                Message
              </label>
              <span id="contact-message-hint" className="field-hint">
                Share details about your inquiry or timeline
              </span>
              <div className="input-wrap">
                <MessageSquare size={18} className="input-icon textarea-icon" aria-hidden="true" />
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  required
                  placeholder="Hi Sumit, I'd love to connect about..."
                  className="form-control"
                  aria-describedby="contact-message-hint"
                  data-error="contact-message-error"
                />
              </div>
              <div id="contact-message-error" className="error-msg">
                <AlertCircle size={15} aria-hidden="true" />
                Please write a message before submitting.
              </div>
            </div>

            {status && (
              <div className={`form-banner ${status.type}`} role="status">
                {status.text}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Send size={17} aria-hidden="true" />
              <span>{submitting ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

