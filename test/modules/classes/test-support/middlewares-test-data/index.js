const incorrectDefinitions = require('./incorrect-definitions')
const correctDefinitions = require('./correct-definitions')

const middlewaresTestData = [...incorrectDefinitions, correctDefinitions]

function normalizeResult (res) {
  const resNormalized = Object.assign({}, res)
  if (resNormalized.middlewares) {
    resNormalized.middlewaresLength =
      Array.isArray(resNormalized.middlewares) &&
      resNormalized.middlewares.length
    delete resNormalized.middlewares
  }
  return resNormalized
}

module.exports = { middlewaresTestData, normalizeResult }
