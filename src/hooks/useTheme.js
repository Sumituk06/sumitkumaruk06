import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'color-scheme';

function getSystemScheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStoredScheme() {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val === 'light' || val === 'dark' ? val : null;
  } catch {
    return null;
  }
}

export function useTheme() {
  const [storedScheme, setStoredScheme] = useState(readStoredScheme);
  const [systemScheme, setSystemScheme] = useState(getSystemScheme);

  const resolvedScheme = storedScheme ?? systemScheme;

  // Keep <meta name="color-scheme"> synchronized
  useEffect(() => {
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', storedScheme ?? 'light dark');
    }
  }, [storedScheme]);

  // Listen for OS scheme changes
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemScheme(e.matches ? 'dark' : 'light');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setStoredScheme(e.newValue === 'light' || e.newValue === 'dark' ? e.newValue : null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    const target = resolvedScheme === 'dark' ? 'light' : 'dark';
    const currentSystem = getSystemScheme();

    // Per dark-mode-toggle guidance: if target matches system, remove stored override
    // so the site follows system changes again; otherwise persist literally.
    if (target === currentSystem) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      setStoredScheme(null);
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, target);
      } catch {}
      setStoredScheme(target);
    }
  }, [resolvedScheme]);

  return { resolvedScheme, toggleTheme };
}

