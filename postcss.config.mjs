/**
 * PostCSS configuration.
 *
 * PostCSS is a CSS preprocessor. Tailwind CSS v4 uses @tailwindcss/postcss
 * as its PostCSS plugin, which replaces the old tailwindcss + autoprefixer setup.
 *
 * Docs: https://tailwindcss.com/docs/installation/using-postcss
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
