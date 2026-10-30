import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { getCurrentTheme, setTheme, Theme } from '../utils/theme';

/** Botón para cambiar entre modo día y modo noche. */
export const ThemeToggle: React.FC = () => {
  const [theme, setThemeState] = useState<Theme>(() => getCurrentTheme());

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemeState(next);
  };

  const goingToLight = theme === 'dark';
  return (
    <button
      onClick={toggle}
      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
      title={goingToLight ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
      aria-label={goingToLight ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
    >
      {goingToLight ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-400" />}
    </button>
  );
};
