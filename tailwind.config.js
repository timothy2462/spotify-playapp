
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./app/**/*.{js,jsx,ts,tsx}", 
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#1e1e1e',
        primary: '#1DB954',
        white: '#ffffff',
        muted: '#999999',
        song: '#51323C',
        'spotify-green': '#1DB954',
        'spotify-black': '#191414',
        'spotify-gray': '#535353',
        gray: {
          400: '#9ca3af',  
          600: '#4b5563',  
          800: '#1f2937',  
          custom: '#aaaaaa',
        }
      },
       textShadow: {
        shadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
      },
      fontFamily: {
        'gotham-bold': ['Gotham-Bold'],
        'poppins': ['Poppins-Regular'],
        'poppins-semibold': ['Poppins-SemiBold'],
        'dm-sans': ['DMSans-Regular'],
        'dm-sans-bold': ['DMSans-Bold'],
      },
    },
  },
  plugins: [],
}