import { DesignTokens } from './design-tokens';

// Utility to convert design tokens to CSS custom properties
export const tokensToCSS = (tokens: DesignTokens): string => {
  const cssProperties: string[] = [];

  // Colors
  Object.entries(tokens.colors.primary).forEach(([key, value]) => {
    cssProperties.push(`--color-primary-${key}: ${value};`);
  });
  
  Object.entries(tokens.colors.secondary).forEach(([key, value]) => {
    cssProperties.push(`--color-secondary-${key}: ${value};`);
  });
  
  Object.entries(tokens.colors.accent).forEach(([key, value]) => {
    cssProperties.push(`--color-accent-${key}: ${value};`);
  });
  
  Object.entries(tokens.colors.neutral).forEach(([key, value]) => {
    cssProperties.push(`--color-neutral-${key}: ${value};`);
  });
  
  Object.entries(tokens.colors.semantic).forEach(([key, value]) => {
    cssProperties.push(`--color-${key}: ${value};`);
  });
  
  Object.entries(tokens.colors.background).forEach(([key, value]) => {
    cssProperties.push(`--color-bg-${key}: ${value};`);
  });
  
  Object.entries(tokens.colors.text).forEach(([key, value]) => {
    cssProperties.push(`--color-text-${key}: ${value};`);
  });
  
  Object.entries(tokens.colors.border).forEach(([key, value]) => {
    cssProperties.push(`--color-border-${key}: ${value};`);
  });

  // Typography
  Object.entries(tokens.typography.fontFamilies).forEach(([key, value]) => {
    cssProperties.push(`--font-${key}: ${value};`);
  });
  
  Object.entries(tokens.typography.fontSizes).forEach(([key, value]) => {
    cssProperties.push(`--text-${key}: ${value};`);
  });
  
  Object.entries(tokens.typography.fontWeights).forEach(([key, value]) => {
    cssProperties.push(`--font-weight-${key}: ${value};`);
  });
  
  Object.entries(tokens.typography.lineHeights).forEach(([key, value]) => {
    cssProperties.push(`--leading-${key}: ${value};`);
  });

  // Spacing
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    cssProperties.push(`--spacing-${key}: ${value};`);
  });

  // Border Radius
  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    cssProperties.push(`--radius-${key}: ${value};`);
  });

  // Shadows
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    cssProperties.push(`--shadow-${key}: ${value};`);
  });

  // Animations
  Object.entries(tokens.animations.durations).forEach(([key, value]) => {
    cssProperties.push(`--duration-${key}: ${value};`);
  });
  
  Object.entries(tokens.animations.easings).forEach(([key, value]) => {
    cssProperties.push(`--ease-${key}: ${value};`);
  });

  // Breakpoints
  Object.entries(tokens.breakpoints).forEach(([key, value]) => {
    cssProperties.push(`--screen-${key}: ${value};`);
  });

  return cssProperties.join('\n  ');
};

// Apply theme to DOM by injecting CSS custom properties
export const applyThemeToDOM = (tokens: DesignTokens): void => {
  const cssText = tokensToCSS(tokens);
  
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
      ${cssText}
    }
  `;
  
  document.head.appendChild(styleElement);
  
  // Add theme class to body for CSS selectors
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  document.body.classList.add(`theme-${tokens.colors.primary[500].replace('#', '')}`);
};

// Generate Tailwind-style classes from tokens
export const generateTailwindClasses = (tokens: DesignTokens): Record<string, string> => {
  return {
    // Background classes
    'bg-primary': `background-color: ${tokens.colors.primary[500]};`,
    'bg-primary-50': `background-color: ${tokens.colors.primary[50]};`,
    'bg-primary-100': `background-color: ${tokens.colors.primary[100]};`,
    'bg-primary-500': `background-color: ${tokens.colors.primary[500]};`,
    'bg-primary-900': `background-color: ${tokens.colors.primary[900]};`,
    
    'bg-secondary': `background-color: ${tokens.colors.secondary[500]};`,
    'bg-secondary-50': `background-color: ${tokens.colors.secondary[50]};`,
    'bg-secondary-100': `background-color: ${tokens.colors.secondary[100]};`,
    'bg-secondary-500': `background-color: ${tokens.colors.secondary[500]};`,
    'bg-secondary-900': `background-color: ${tokens.colors.secondary[900]};`,
    
    'bg-accent': `background-color: ${tokens.colors.accent[500]};`,
    'bg-success': `background-color: ${tokens.colors.semantic.success};`,
    'bg-warning': `background-color: ${tokens.colors.semantic.warning};`,
    'bg-error': `background-color: ${tokens.colors.semantic.error};`,
    
    // Text classes
    'text-primary': `color: ${tokens.colors.text.primary};`,
    'text-secondary': `color: ${tokens.colors.text.secondary};`,
    'text-tertiary': `color: ${tokens.colors.text.tertiary};`,
    'text-inverse': `color: ${tokens.colors.text.inverse};`,
    
    'text-primary-500': `color: ${tokens.colors.primary[500]};`,
    'text-secondary-500': `color: ${tokens.colors.secondary[500]};`,
    'text-accent-500': `color: ${tokens.colors.accent[500]};`,
    
    // Border classes
    'border-primary': `border-color: ${tokens.colors.border.primary};`,
    'border-secondary': `border-color: ${tokens.colors.border.secondary};`,
    'border-focus': `border-color: ${tokens.colors.border.focus};`,
    
    // Rounded classes
    'rounded-sm': `border-radius: ${tokens.borderRadius.sm};`,
    'rounded-md': `border-radius: ${tokens.borderRadius.md};`,
    'rounded-lg': `border-radius: ${tokens.borderRadius.lg};`,
    'rounded-xl': `border-radius: ${tokens.borderRadius.xl};`,
    'rounded-full': `border-radius: ${tokens.borderRadius.full};`,
    
    // Shadow classes
    'shadow-sm': `box-shadow: ${tokens.shadows.sm};`,
    'shadow-md': `box-shadow: ${tokens.shadows.md};`,
    'shadow-lg': `box-shadow: ${tokens.shadows.lg};`,
    'shadow-xl': `box-shadow: ${tokens.shadows.xl};`,
  };
};

// Theme-aware className utility
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Get theme-aware color value
export const getThemeColor = (
  colorPath: string,
  tokens: DesignTokens
): string => {
  const parts = colorPath.split('.');
  let current: any = tokens.colors;
  
  for (const part of parts) {
    current = current?.[part];
  }
  
  return current || '#000000';
};

// Generate gradient from theme colors
export const createThemeGradient = (
  direction: string,
  colors: string[],
  tokens: DesignTokens
): string => {
  const resolvedColors = colors.map(color => getThemeColor(color, tokens));
  return `linear-gradient(${direction}, ${resolvedColors.join(', ')})`;
};

// Responsive design utilities
export const createMediaQuery = (breakpoint: keyof DesignTokens['breakpoints'], tokens: DesignTokens): string => {
  return `@media (min-width: ${tokens.breakpoints[breakpoint]})`;
};

// Animation utilities
export const createTransition = (
  property: string,
  duration: keyof DesignTokens['animations']['durations'],
  easing: keyof DesignTokens['animations']['easings'],
  tokens: DesignTokens
): string => {
  return `${property} ${tokens.animations.durations[duration]} ${tokens.animations.easings[easing]}`;
};

// Theme validation
export const validateTheme = (tokens: DesignTokens): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required color properties
  if (!tokens.colors?.primary?.['500']) {
    errors.push('Primary color 500 is required');
  }
  
  if (!tokens.colors?.secondary?.['500']) {
    errors.push('Secondary color 500 is required');
  }
  
  // Check contrast ratios (basic validation)
  const primaryBg = tokens.colors.background.primary;
  const primaryText = tokens.colors.text.primary;
  
  if (primaryBg === primaryText) {
    errors.push('Background and text colors cannot be the same');
  }
  
  // Check required typography
  if (!tokens.typography?.fontFamilies?.primary) {
    errors.push('Primary font family is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};