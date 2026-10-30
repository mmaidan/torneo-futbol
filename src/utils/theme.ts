export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'chancay_theme';
const THEME_COLOR: Record<Theme, string> = { dark: '#050a18', light: '#f4f6fb' };

export function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

export function getSystemTheme(): Theme {
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function getCurrentTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'light' || attr === 'dark' ? attr : getStoredTheme() ?? getSystemTheme();
}

/** Aplica el tema a la página (y al color de la barra del celular). */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.classList.toggle('dark', theme === 'dark');
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLOR[theme]);
}

/** Aplica y recuerda la elección de la persona en este dispositivo. */
export function setTheme(theme: Theme): void {
  applyTheme(theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* sin almacenamiento: el cambio vale mientras la app esté abierta */
  }
}
