const colors = require('@egoist/md-colors')

module.exports = {
  plugins: [
    require('autoprefixer'),
    require('tailwindcss')({
      purge: [
        './src/**/*.html',
        './src/**/*.tsx',
      ],
      theme: {
        colors,
        variants: {
          backgroundColor: ['responsive', 'odd', 'hover', 'focus', 'even'],
        },
        extend: {
          spacing: {
            '72': '18rem',
            '84': '21rem',
            '96': '24rem',
          }
        }
      }
    })
  ]
}