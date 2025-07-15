import * as React from 'react';
import { DesignTokens, defaultTokens } from './design-tokens';

// Theme Configuration
export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'personal' | 'cultural' | 'agent' | 'accessibility';
  tokens: DesignTokens;
  preview?: string; // Base64 image or gradient
}

// Predefined Themes
export const themes: Record<string, ThemeConfig> = {
  'mundo-tango': {
    id: 'mundo-tango',
    name: 'Mundo Tango Ocean',
    description: 'Turquoise to blue gradient inspired by ocean depths',
    category: 'business',
    tokens: defaultTokens,
    preview: 'linear-gradient(135deg, #38b2ac, #3182ce)',
  },
  'life-ceo': {
    id: 'life-ceo',
    name: 'Life CEO Executive',
    description: 'Professional dark theme for business focus',
    category: 'business',
    tokens: {
      ...defaultTokens,
      colors: {
        ...defaultTokens.colors,
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        background: {
          primary: '#0f172a',
          secondary: '#1e293b',
          tertiary: '#334155',
          overlay: 'rgba(0, 0, 0, 0.8)',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#cbd5e1',
          tertiary: '#94a3b8',
          inverse: '#0f172a',
        },
      },
    },
    preview: 'linear-gradient(135deg, #0f172a, #334155)',
  },
  'buenos-aires': {
    id: 'buenos-aires',
    name: 'Buenos Aires',
    description: 'Cultural theme inspired by Argentine colors',
    category: 'cultural',
    tokens: {
      ...defaultTokens,
      colors: {
        ...defaultTokens.colors,
        primary: {
          50: '#fef3c7',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
          950: '#1c0701',
        },
        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        accent: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
      },
    },
    preview: 'linear-gradient(135deg, #f59e0b, #3b82f6, #ef4444)',
  },
  'zen-minimal': {
    id: 'zen-minimal',
    name: 'Zen Minimal',
    description: 'Clean minimal theme for focus and clarity',
    category: 'personal',
    tokens: {
      ...defaultTokens,
      colors: {
        ...defaultTokens.colors,
        primary: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        background: {
          primary: '#ffffff',
          secondary: '#f9fafb',
          tertiary: '#f3f4f6',
          overlay: 'rgba(0, 0, 0, 0.1)',
        },
        text: {
          primary: '#111827',
          secondary: '#4b5563',
          tertiary: '#9ca3af',
          inverse: '#ffffff',
        },
      },
    },
    preview: 'linear-gradient(135deg, #ffffff, #f3f4f6)',
  },
  'agent-health': {
    id: 'agent-health',
    name: 'Health Agent',
    description: 'Calming green theme for health and wellness',
    category: 'agent',
    tokens: {
      ...defaultTokens,
      colors: {
        ...defaultTokens.colors,
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
      },
    },
    preview: 'linear-gradient(135deg, #22c55e, #86efac)',
  },
  'high-contrast': {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Accessibility-focused high contrast theme',
    category: 'accessibility',
    tokens: {
      ...defaultTokens,
      colors: {
        ...defaultTokens.colors,
        primary: {
          50: '#ffffff',
          100: '#ffffff',
          200: '#ffffff',
          300: '#ffffff',
          400: '#ffffff',
          500: '#000000',
          600: '#000000',
          700: '#000000',
          800: '#000000',
          900: '#000000',
          950: '#000000',
        },
        background: {
          primary: '#ffffff',
          secondary: '#ffffff',
          tertiary: '#f3f4f6',
          overlay: 'rgba(0, 0, 0, 0.9)',
        },
        text: {
          primary: '#000000',
          secondary: '#000000',
          tertiary: '#4b5563',
          inverse: '#ffffff',
        },
        border: {
          primary: '#000000',
          secondary: '#000000',
          focus: '#0066cc',
        },
      },
    },
    preview: 'linear-gradient(135deg, #ffffff, #000000)',
  },
};

// Theme Context
interface ThemeContextType {
  currentTheme: ThemeConfig;
  setTheme: (themeId: string) => void;
  availableThemes: ThemeConfig[];
  isLoading: boolean;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

// Theme Provider Component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = React.useState<string>('mundo-tango');
  const [isLoading, setIsLoading] = React.useState(true);

  // Load theme preference from localStorage
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('life-ceo-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentThemeId(savedTheme);
    }
    setIsLoading(false);
  }, []);

  // Apply theme to DOM when theme changes
  React.useEffect(() => {
    if (!isLoading) {
      const theme = themes[currentThemeId];
      
      // Apply theme via CSS custom properties
      const tokensToCSS = (tokens: DesignTokens): string => {
        const cssProperties: string[] = [];
        
        // Colors
        Object.entries(tokens.colors.primary).forEach(([key, value]) => {
          cssProperties.push(`--color-primary-${key}: ${value};`);
        });
        
        Object.entries(tokens.colors.secondary).forEach(([key, value]) => {
          cssProperties.push(`--color-secondary-${key}: ${value};`);
        });
        
        Object.entries(tokens.colors.background).forEach(([key, value]) => {
          cssProperties.push(`--color-bg-${key}: ${value};`);
        });
        
        Object.entries(tokens.colors.text).forEach(([key, value]) => {
          cssProperties.push(`--color-text-${key}: ${value};`);
        });
        
        return cssProperties.join('\n  ');
      };
      
      // Remove existing theme styles
      const existingStyle = document.getElementById('theme-variables');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      // Create and inject new theme styles
      const styleElement = document.createElement('style');
      styleElement.id = 'theme-variables';
      styleElement.textContent = `
        :root {
          ${tokensToCSS(theme.tokens)}
        }
      `;
      
      document.head.appendChild(styleElement);
      localStorage.setItem('life-ceo-theme', currentThemeId);
    }
  }, [currentThemeId, isLoading]);

  const setTheme = (themeId: string) => {
    if (themes[themeId]) {
      setCurrentThemeId(themeId);
    }
  };

  const value: ThemeContextType = {
    currentTheme: themes[currentThemeId],
    setTheme,
    availableThemes: Object.values(themes),
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Higher-order component for theme-aware components
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: ThemeConfig }>
) => {
  return (props: P) => {
    const { currentTheme } = useTheme();
    return <Component {...props} theme={currentTheme} />;
  };
};