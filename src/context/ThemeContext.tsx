import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThemeId, ThemeConfig } from '../types';

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'pink-purple': {
    id: 'pink-purple',
    name: 'بينك في موف 🌸💜',
    primaryColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    badgeBg: 'bg-pink-100 text-pink-700 border-pink-200',
    accentBg: 'bg-gradient-to-r from-pink-500 to-purple-600',
    gradient: 'from-pink-50 via-purple-50/40 to-white',
    cardBorder: 'border-pink-200/80 hover:border-pink-300',
    activeTab: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/25',
  },
  'rose-red': {
    id: 'rose-red',
    name: 'زهري في أحمر 🌹❤️',
    primaryColor: '#f43f5e',
    secondaryColor: '#e11d48',
    badgeBg: 'bg-rose-100 text-rose-700 border-rose-200',
    accentBg: 'bg-gradient-to-r from-rose-500 to-red-600',
    gradient: 'from-rose-50 via-red-50/40 to-white',
    cardBorder: 'border-rose-200/80 hover:border-rose-300',
    activeTab: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25',
  },
  'mint-emerald': {
    id: 'mint-emerald',
    name: 'نعناعي في زمردي 🌿💚',
    primaryColor: '#0d9488',
    secondaryColor: '#059669',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    accentBg: 'bg-gradient-to-r from-teal-500 to-emerald-600',
    gradient: 'from-teal-50 via-emerald-50/40 to-white',
    cardBorder: 'border-emerald-200/80 hover:border-emerald-300',
    activeTab: 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-emerald-500/25',
  },
  'peach-amber': {
    id: 'peach-amber',
    name: 'خوخي في عسلي 🍑🍯',
    primaryColor: '#ea580c',
    secondaryColor: '#d97706',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    accentBg: 'bg-gradient-to-r from-orange-500 to-amber-600',
    gradient: 'from-orange-50 via-amber-50/40 to-white',
    cardBorder: 'border-amber-200/80 hover:border-amber-300',
    activeTab: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-amber-500/25',
  },
};

interface ThemeContextType {
  theme: ThemeId;
  themeConfig: ThemeConfig;
  setTheme: (t: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{
  initialTheme?: ThemeId;
  onThemeChange?: (t: ThemeId) => void;
  children: React.ReactNode;
}> = ({ initialTheme = 'pink-purple', onThemeChange, children }) => {
  const [theme, setThemeState] = useState<ThemeId>(initialTheme);

  useEffect(() => {
    if (initialTheme && initialTheme !== theme) {
      setThemeState(initialTheme);
    }
  }, [initialTheme]);

  const setTheme = (t: ThemeId) => {
    setThemeState(t);
    if (onThemeChange) {
      onThemeChange(t);
    }
  };

  const themeConfig = THEMES[theme] || THEMES['pink-purple'];

  return (
    <ThemeContext.Provider value={{ theme, themeConfig, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};
