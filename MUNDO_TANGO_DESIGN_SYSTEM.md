# Mundo Tango Design System v2.0
> Ocean Theme Edition - Consolidated design documentation for the Mundo Tango platform
> Updated: January 15, 2025

## Table of Contents
1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Components](#components)
5. [Animations](#animations)
6. [Design Principles](#design-principles)
7. [Implementation Guide](#implementation-guide)

## Color System

### Primary Colors - Turquoise to Blue Gradient
Based on the natural turquoise-blue hair color reference, our primary palette flows from vibrant turquoise to deep ocean blue.

```css
/* Primary Turquoise-Blue Scale */
--color-turquoise-50: #e6fffa;
--color-turquoise-100: #b2f5ea;
--color-turquoise-200: #81e6d9;
--color-turquoise-300: #4fd1c5;
--color-turquoise-400: #38b2ac;
--color-turquoise-500: #319795;
--color-turquoise-600: #2c7a7b;
--color-turquoise-700: #285e61;
--color-turquoise-800: #234e52;
--color-turquoise-900: #1d4044;

/* Primary Blue Scale */
--color-blue-50: #ebf8ff;
--color-blue-100: #bee3f8;
--color-blue-200: #90cdf4;
--color-blue-300: #63b3ed;
--color-blue-400: #4299e1;
--color-blue-500: #3182ce;
--color-blue-600: #2b6cb0;
--color-blue-700: #2c5282;
--color-blue-800: #2a4e7c;
--color-blue-900: #1a365d;

/* Primary Gradient */
--gradient-primary: linear-gradient(135deg, #38b2ac 0%, #3182ce 100%);
--gradient-primary-hover: linear-gradient(135deg, #319795 0%, #2b6cb0 100%);
--gradient-primary-subtle: linear-gradient(135deg, #e6fffa 0%, #ebf8ff 100%);
```

### Secondary Colors - Purple to Blue (Legacy)
Our original purple-blue gradient becomes the secondary palette for accents and special features.

```css
/* Secondary Purple-Blue Scale */
--color-purple-50: #faf5ff;
--color-purple-100: #f3e8ff;
--color-purple-200: #e9d5ff;
--color-purple-300: #d8b4fe;
--color-purple-400: #c084fc;
--color-purple-500: #a855f7;
--color-purple-600: #9333ea;
--color-purple-700: #7c3aed;
--color-purple-800: #6b21a8;
--color-purple-900: #581c87;

/* Secondary Gradient */
--gradient-secondary: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%);
--gradient-secondary-hover: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
```

### Semantic Colors

```css
/* Success */
--color-success: #10b981;
--color-success-bg: #d1fae5;
--color-success-border: #6ee7b7;

/* Warning */
--color-warning: #f59e0b;
--color-warning-bg: #fef3c7;
--color-warning-border: #fcd34d;

/* Error */
--color-error: #ef4444;
--color-error-bg: #fee2e2;
--color-error-border: #fca5a5;

/* Info */
--color-info: #3b82f6;
--color-info-bg: #dbeafe;
--color-info-border: #93c5fd;
```

### Neutral Colors

```css
/* Gray Scale */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;
--color-gray-950: #030712;
```

## Typography

### Font Families
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-secondary: 'Playfair Display', Georgia, serif;
--font-mono: 'JetBrains Mono', Monaco, monospace;
```

### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
```

### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Line Heights
```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

## Spacing & Layout

### Spacing Scale
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Border Radius
```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-base: 0.25rem;  /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;
```

### Shadows
```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
--shadow-2xl: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
```

## Components

### Buttons

#### Primary Button (Turquoise-Blue Gradient)
```css
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: var(--gradient-primary-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
```

#### Secondary Button (Purple-Blue Gradient)
```css
.btn-secondary {
  background: var(--gradient-secondary);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}
```

### Cards
```css
.card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-base);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-gradient-border {
  position: relative;
  background: white;
  border-radius: var(--radius-xl);
  padding: 2px;
}

.card-gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-xl);
  background: var(--gradient-primary);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  padding: 2px;
}
```

### Forms
```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-turquoise-500);
  box-shadow: 0 0 0 3px rgba(56, 178, 172, 0.1);
}
```

### Navigation
```css
.nav-link {
  color: var(--color-gray-700);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--color-turquoise-600);
  background: var(--color-turquoise-50);
}

.nav-link.active {
  color: white;
  background: var(--gradient-primary);
}
```

## Animations

### Transitions
```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
--transition-slower: 500ms ease;
```

### Keyframes
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

## Design Principles

### 1. **Ocean-Inspired Flow**
- Primary colors flow from turquoise to blue, evoking ocean depths
- Smooth gradients and transitions create fluid user experience
- Natural, calming color progression

### 2. **Hierarchical Clarity**
- Turquoise-blue for primary actions and focus areas
- Purple-blue for secondary elements and special features
- Gray scale for content and supporting elements

### 3. **Consistent Spacing**
- 4px base unit (0.25rem)
- Consistent padding and margins using the spacing scale
- Generous whitespace for breathing room

### 4. **Accessible Contrast**
- All text meets WCAG AA standards
- Interactive elements have clear hover/focus states
- Color combinations tested for accessibility

### 5. **Responsive Design**
- Mobile-first approach
- Flexible components that adapt to screen sizes
- Touch-friendly interactive elements

## Implementation Guide

### 1. CSS Variables Setup
All design tokens should be defined as CSS custom properties in the root:

```css
:root {
  /* Add all color, typography, spacing variables here */
}
```

### 2. Component Classes
Use utility-first approach with semantic component classes:

```css
/* Utility classes */
.text-turquoise-500 { color: var(--color-turquoise-500); }
.bg-gradient-primary { background: var(--gradient-primary); }

/* Component classes */
.btn { /* base button styles */ }
.btn-primary { /* primary button variant */ }
```

### 3. Tailwind Integration
Configure Tailwind to use our design tokens:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        turquoise: {
          50: '#e6fffa',
          // ... rest of scale
        }
      }
    }
  }
}
```

### 4. Theme Provider Updates
Update the theme provider to support the new color system:

```typescript
// theme-provider.tsx
export const themes = {
  'mundo-tango-v2': {
    id: 'mundo-tango-v2',
    name: 'Mundo Tango Ocean',
    description: 'Turquoise to blue gradient inspired by ocean depths',
    category: 'business',
    tokens: {
      // Updated design tokens
    }
  }
}
```

## Migration Checklist

- [ ] Update root CSS variables in index.css
- [ ] Update theme provider with new color tokens
- [ ] Update Tailwind configuration
- [ ] Replace purple-blue gradients with turquoise-blue in primary elements
- [ ] Move purple-blue to secondary/accent usage
- [ ] Update component styles to use new color system
- [ ] Test all interactive states (hover, focus, active)
- [ ] Verify accessibility compliance
- [ ] Update documentation and style guide

---

*Last Updated: January 15, 2025*
*Version: 2.0 - Turquoise Ocean Theme*