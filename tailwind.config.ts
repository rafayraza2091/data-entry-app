import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0d9488',
        primaryDark: '#0f766e',
        success: '#33cc33',
        danger: '#ff3300',
        warning: '#ffcc00',
        lightgray: '#f2f2f2',
        midgray: '#999999',
        darkgray: '#333333',
        // Kanban specific grays
        headingGray: '#172b4d',
        subtextGray: '#5e6c84',
        borderGray: '#dfe1e6',
        kanbanBg1: '#f4f5f7',
        kanbanBg2: '#f8fafc',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
