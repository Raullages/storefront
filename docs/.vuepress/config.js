const path = require('path')
const fs = require('fs')
const directoryPath = path.join(__dirname, '../components')
const files = fs.readdirSync(directoryPath)
const componentDocs = []

for (const file of files) {
  componentDocs.push(`/components/${file}`)
}

module.exports = {
  themeConfig: {
    repo: 'ecomplus/storefront',
    logo: '/assets/img/logo.png',
    nav: [
      {
        text: 'Home',
        link: '/'
      },
      {
        text: 'GitHub',
        link: 'https://github.com/ecomplus/storefront'
      }
    ],
    sidebar: [
      {
        title: 'Getting Started',
        collapsable: false,
        children: ['']
      },
      {
        title: 'Components',
        collapsable: true,
        children: [...componentDocs]
      }
    ]
  }
}
