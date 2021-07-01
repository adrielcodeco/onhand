const fs = require('fs')
const path = require('path')

const resolve = filePath => path.resolve(__dirname, filePath)

const version = process.argv[2]
console.log('version:', version)

const coverPageFilePath = resolve('../docs/_coverpage.md')
let coverpageContent = fs.readFileSync(coverPageFilePath, 'utf-8')
coverpageContent = coverpageContent.replace(
  /<small>.+<\/small>/g,
  `<small>${version}</small>`,
)
fs.writeFileSync(coverPageFilePath, coverpageContent)
