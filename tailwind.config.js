/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        instagram: {
          start: '#E1306C',
          end: '#FD8D32',
        },
        facebook: '#1877F2',
        linkedin: '#0A66C2',
        twitter: '#000000',
        tiktok: {
          pink: '#FF0050',
          cyan: '#00F2EA',
        },
        youtube: '#FF0000',
      },
    },
  },
  plugins: [],
}
