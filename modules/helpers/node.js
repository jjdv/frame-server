const path = require('path')
const { isFile } = require('./basic')

function argValue (argName, argNameAlt) {
  if (!argName || process.argv.length < 4) return undefined

  let argIndex = process.argv.indexOf(argName, 2)
  if (argIndex === -1 && argNameAlt) {
    argIndex = process.argv.indexOf(argNameAlt, 2)
  }
  const argValue =
    ++argIndex && process.argv.length > argIndex && process.argv[argIndex]

  return argValue || undefined
}

function findFileInDirs (root, dirs, fileName) {
  let confPath
  for (const dir of dirs) {
    confPath = path.resolve(root, dir, fileName)
    if (isFile(confPath)) return confPath
  }
  return undefined
}

module.exports = {
  argValue,
  findFileInDirs
}
