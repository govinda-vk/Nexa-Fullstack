/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
    "./node_modules/flowbite-react/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        lemon: "#FDFC50", 
        limelemon: "#B6ED43",
        purple: "#D200D3"
      },
      fontFamily: {
        // Sets 'Inter' as the default sans-serif font
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        // Custom shadow for the brutalist style
        'brutalist': '5px 5px 0 #000, 10px 10px 0 #4a90e2',
      },
      animation: {
        // Animation for the input focus border pulse
        'focus-pulse': 'focus-pulse 4s cubic-bezier(0.25, 0.8, 0.25, 1) infinite',
      },
      keyframes: {
        'focus-pulse': {
          '0%, 100%': { borderColor: '#000' },
          '50%': { borderColor: '#4a90e2' },
        },
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}