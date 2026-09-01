/**
 * AgriAI Design Tokens — single source of truth for colors and spacing.
 * Per project rule #7: no hardcoded hex colors scattered through components.
 *
 * Palette: deep green, fresh green, earth tones, white, neutral gray.
 */

export const colors = {
  // Deep greens (primary brand)
  deepGreen: {
    900: '#0d2f20',
    800: '#14401f',
    700: '#1a5c31',
    600: '#1e7a3a',
  },
  // Fresh greens (accent)
  freshGreen: {
    500: '#2ea848',
    400: '#46c05b',
    300: '#6fdb80',
  },
  // Earth tones (secondary / warm accents)
  earth: {
    700: '#7a4b1c',
    600: '#96601f',
    500: '#b07a2b',
    400: '#c79a4b',
    300: '#ddba77',
  },
  // Neutral grays
  neutral: {
    50: '#f8faf8',
    100: '#f1f5f0',
    200: '#e2e8e1',
    300: '#cbd5ca',
    400: '#94a39b',
    500: '#64756d',
    600: '#475a52',
    700: '#33453e',
    800: '#22322c',
    900: '#101c17',
  },
  white: '#ffffff',
  // Semantic status tokens
  status: {
    success: '#1e7a3a',
    warning: '#b07a2b',
    danger: '#b3402e',
    info: '#2a6ea8',
  },
}

export const spacing = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
}

export const typography = {
  fontFamily: {
    sans: '"Inter", "DM Sans", system-ui, sans-serif',
  },
}

export const radii = {
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  full: '9999px',
}

/**
 * Chart color palette — hex values derived from the design tokens above.
 * Recharts requires hex/literal CSS colors in some props, so charts must pull
 * from here rather than hardcoding hex in components (rule #7).
 */
export const chartColors = {
  fresh: colors.freshGreen[500],
  freshLight: colors.freshGreen[400],
  deep: colors.deepGreen[700],
  earth: colors.earth[500],
  info: colors.status.info,
  neutralGrid: colors.neutral[200],
  neutralText: colors.neutral[500],
  white: colors.white,
  success: colors.status.success,
  warning: colors.status.warning,
  danger: colors.status.danger,
}
