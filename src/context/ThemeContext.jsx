import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const COLOR_PALETTES = [
  {
    id: 'salesport',
    name: 'SalesPort Brand',
    description: 'B2B & Corporate Trust',
    colors: ['#031130', '#185DF1', '#F3F7FE'],
  },
  {
    id: 'prompt-indigo',
    name: 'Prompt Indigo',
    description: 'AI & Modern Tech',
    colors: ['#343A40', '#3333FF', '#00FF90', '#F0F8FF'],
  },
  {
    id: 'deep-teal',
    name: 'Deep Teal & Neon Depth',
    description: 'Data & Analytics',
    colors: ['#022A2C', '#044F64', '#07A7AF', '#EBFDFE'],
  },
  {
    id: 'tangerine',
    name: 'Slate Navy & Tangerine',
    description: 'Collaboration & Productivity',
    colors: ['#1E293B', '#F97316', '#FFF7ED'],
  },
];

export const ThemeProvider = ({ children }) => {
  const [palette, setPalette] = useState(() => {
    try {
      const saved = localStorage.getItem('showroom_pro_color_palette');
      return COLOR_PALETTES.some((option) => option.id === saved) ? saved : 'salesport';
    } catch {
      return 'salesport';
    }
  });

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('showroom_pro_theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('showroom_pro_theme', theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.colorPalette = palette;
    try {
      localStorage.setItem('showroom_pro_color_palette', palette);
    } catch {}
  }, [palette]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark', palette, setPalette }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
