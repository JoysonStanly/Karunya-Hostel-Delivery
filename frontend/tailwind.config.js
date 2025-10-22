module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#FACC15',
        background: '#F9FAFB',
        text: {
          primary: '#111827',
          secondary: '#6B7280'
        },
        success: '#10B981',
        error: '#EF4444',
      },
      boxShadow: {
        card: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)'
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem'
      }
    },
    container: {
      center: true,
      padding: '1rem'
    }
  },
  plugins: [],
}
