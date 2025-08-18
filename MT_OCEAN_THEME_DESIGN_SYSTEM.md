# Mundo Tango Ocean Theme Design System
*For Figma Import & Design Reference*

## Color Palette

### Primary Colors
```css
--turquoise-400: #2dd4bf
--turquoise-500: #14b8a6  
--turquoise-600: #0d9488
--cyan-500: #06b6d4
--cyan-600: #0891b2
--blue-600: #2563eb
```

### Gradients
```css
/* Primary Ocean Gradient */
background: linear-gradient(to right, #2dd4bf, #06b6d4);

/* Extended Ocean Gradient */
background: linear-gradient(135deg, #2dd4bf 0%, #06b6d4 50%, #2563eb 100%);
```

### Neutral Colors
```css
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-400: #9ca3af
--gray-500: #6b7280
--gray-600: #4b5563
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827
```

## Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Sizes
- **Heading 1**: 3rem (48px) - font-bold
- **Heading 2**: 2.25rem (36px) - font-bold  
- **Heading 3**: 1.875rem (30px) - font-semibold
- **Heading 4**: 1.5rem (24px) - font-semibold
- **Body Large**: 1.125rem (18px) - font-normal
- **Body**: 1rem (16px) - font-normal
- **Small**: 0.875rem (14px) - font-normal
- **Tiny**: 0.75rem (12px) - font-normal

## Glassmorphic Cards

### Standard Card
```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(20px);
border-radius: 1rem;
border: 1px solid rgba(255, 255, 255, 0.3);
box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
```

### Dark Glassmorphic
```css
background: rgba(0, 0, 0, 0.4);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

## Spacing System
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)
- **3xl**: 4rem (64px)

## Component Styles

### Buttons

**Primary Button**
```css
background: linear-gradient(to right, #14b8a6, #0891b2);
color: white;
padding: 0.625rem 1.25rem;
border-radius: 0.5rem;
font-weight: 500;
transition: all 0.2s;
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
```

**Secondary Button**
```css
background: white;
color: #14b8a6;
border: 2px solid #14b8a6;
padding: 0.625rem 1.25rem;
border-radius: 0.5rem;
```

**Ghost Button**
```css
background: transparent;
color: #14b8a6;
padding: 0.625rem 1.25rem;
border-radius: 0.5rem;
```

### Input Fields
```css
background: white;
border: 2px solid #e5e7eb;
border-radius: 0.5rem;
padding: 0.625rem 1rem;
transition: border-color 0.2s;
/* Focus state */
border-color: #14b8a6;
box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
```

### Badges
```css
/* Success */
background: #d1fae5;
color: #065f46;

/* Warning */
background: #fef3c7;
color: #92400e;

/* Error */
background: #fee2e2;
color: #991b1b;

/* Info */
background: #dbeafe;
color: #1e40af;
```

## Animation & Transitions

### Hover Effects
```css
/* Lift Effect */
transform: translateY(-2px);
box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.15);

/* Glow Effect */
box-shadow: 0 0 20px rgba(20, 184, 166, 0.4);

/* Scale Effect */
transform: scale(1.02);
```

### Transition Timing
```css
transition: all 0.2s ease-in-out;
```

## Mobile Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

## Icon System
- Primary Icons: Lucide React
- Size Classes: w-4 h-4 (16px), w-5 h-5 (20px), w-6 h-6 (24px)
- Icon Colors: Match text color or use gradient

## Shadow System
```css
/* Small */
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);

/* Medium */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* Large */
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

/* XL */
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* Glow */
box-shadow: 0 0 20px rgba(20, 184, 166, 0.4);
```

## Border Radius
- **Rounded**: 0.25rem
- **Rounded-md**: 0.375rem
- **Rounded-lg**: 0.5rem
- **Rounded-xl**: 0.75rem
- **Rounded-2xl**: 1rem
- **Rounded-full**: 9999px

## Z-Index Scale
- **Base**: 0
- **Dropdown**: 10
- **Sticky**: 20
- **Fixed**: 30
- **Modal Backdrop**: 40
- **Modal**: 50
- **Popover**: 60
- **Tooltip**: 70

---

## Figma Import Instructions

1. **Colors**: Create color styles in Figma using the hex values above
2. **Typography**: Set up text styles matching the font sizes and weights
3. **Components**: Create component variants for buttons, cards, inputs
4. **Effects**: Add blur effects for glassmorphism (Background blur: 20px)
5. **Auto Layout**: Use 8px grid system for consistent spacing

## Component Examples in Figma

### Card Component Properties
- Fill: #FFFFFF at 70% opacity
- Effect: Background blur 20px
- Stroke: #FFFFFF at 30% opacity, 1px
- Corner radius: 16px
- Drop shadow: Y: 8px, Blur: 32px, Color: #1F2687 at 15%

### Button Component Properties
- Padding: 10px horizontal, 20px vertical
- Corner radius: 8px
- Text: 16px, Medium weight
- Auto layout with 8px gap for icon + text

This design system ensures consistency across the Mundo Tango platform with the signature Ocean Theme glassmorphic style.