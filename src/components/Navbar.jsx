import { useEffect, useRef, useState } from 'react';
import { FileText, Menu, Moon, Sun, X, ChevronRight } from 'lucide-react';
import { PROFILE } from '../data/portfolioData';

const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'aibot', label: 'AI Bot' },
  { id: 'contact', label: 'Contact' },
];

export default function Navbar({ activeSection, resolvedScheme, onToggleTheme, onOpenResume }) {
  const drawerRef = useRef(null);
  const scrollerRef = useRef(null);
  const sheetRef = useRef(null);
  const openBtnRef = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = async () => {
    const drawer = drawerRef.current;
    const scroller = scrollerRef.current;
    if (!drawer || !scroller) return;

    drawer.showModal();

    if (!CSS.supports('scroll-initial-target', 'nearest')) {
      scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'instant' });
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }

    scroller.scrollTo({ left: 0, behavior: 'auto' });
  };

  const closeDrawer = () => {
    const drawer = drawerRef.current;
    const scroller = scrollerRef.current;
    if (!drawer || !scroller) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      drawer.close();
      setDrawerOpen(false);
      return;
    }

    scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'auto' });
  };

  useEffect(() => {
    const drawer = drawerRef.current;
    const scroller = scrollerRef.current;
    const sheet = sheetRef.current;
    if (!drawer || !scroller || !sheet) return;

    const visibleThreshold = 1 / Math.max(window.innerWidth, 320);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (!entry) return;
        if (entry.intersectionRatio < visibleThreshold && drawer.open) {
          drawer.close();
          setDrawerOpen(false);
        }
        if (entry.intersectionRatio >= 0.99) {
          setDrawerOpen(true);
        }
      },
      { root: drawer, threshold: [visibleThreshold, 1] }
    );
    observer.observe(sheet);

    let cleanupScroll = null;
    if (!CSS.supports('animation-timeline', 'scroll()')) {
      const onScroll = () => {
        const width = sheet.offsetWidth || 1;
        const ratio = Math.max(0, Math.min(1, 1 - scroller.scrollLeft / width));
        drawer.style.setProperty('--drawer-backdrop', String(ratio));
      };
      scroller.addEventListener('scroll', onScroll, { passive: true });
      cleanupScroll = () => scroller.removeEventListener('scroll', onScroll);
    }

    const onCancel = (e) => {
      if (e.cancelable) {
        e.preventDefault();
        closeDrawer();
      }
    };

    drawer.addEventListener('cancel', onCancel);

    return () => {
      observer.disconnect();
      cleanupScroll?.();
      drawer.removeEventListener('cancel', onCancel);
    };
  }, []);

  const nextThemeLabel =
    resolvedScheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <div className="nav-wrapper">
      <nav className="navBar" aria-label="Primary navigation">
        <a href="#home" className="brand">
          <span className="brand-badge" aria-hidden="true">
            {PROFILE.monogram}
          </span>
          <span>{PROFILE.brand}</span>
        </a>

        <div className="navRight">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`navLink ${activeSection === item.id ? 'active' : ''}`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="nav-actions">
          <button type="button" className="nav-resume-btn" onClick={onOpenResume}>
            <FileText size={16} aria-hidden="true" />
            <span>Resume</span>
          </button>

          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={nextThemeLabel}
            title={nextThemeLabel}
          >
            <span className="icon-to-light" aria-hidden="true">
              <Sun size={18} />
            </span>
            <span className="icon-to-dark" aria-hidden="true">
              <Moon size={18} />
            </span>
          </button>

          <button
            ref={openBtnRef}
            type="button"
            className="mobile-menu-btn"
            onClick={openDrawer}
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav-drawer"
          >
            <Menu size={19} aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* Native <dialog> Navigation Drawer with Scroll Snap swipe dismissal */}
      <dialog
        ref={drawerRef}
        id="mobile-nav-drawer"
        className="Drawer"
        aria-label="Navigation drawer"
        onClick={(e) => {
          if (sheetRef.current && !sheetRef.current.contains(e.target)) {
            closeDrawer();
          }
        }}
      >
        <div ref={scrollerRef} className="Drawer-scroller">
          <nav ref={sheetRef} className="Drawer-sheet" aria-label="Mobile navigation">
            <div className="Drawer-header">
              <span className="brand">
                <span className="brand-badge" aria-hidden="true">
                  {PROFILE.monogram}
                </span>
                <span>{PROFILE.brand}</span>
              </span>
              <button
                type="button"
                className="Drawer-close"
                onClick={closeDrawer}
                aria-label="Close navigation menu"
                autoFocus
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="Drawer-nav">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`Drawer-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={closeDrawer}
                >
                  <span>{item.label}</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </a>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                closeDrawer();
                onOpenResume();
              }}
            >
              <FileText size={17} aria-hidden="true" />
              Preview Resume
            </button>
          </nav>
        </div>
      </dialog>
    </div>
  );
}

