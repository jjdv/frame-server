const Status = require('../classes/status')

const validateAndGetView = require('./view')
const validateAndGetServerMiddlewares = require('./server-middlewares')
const validateAndGetSiteMiddlewares = require('./site-middlewares')
const validateAndGetServeDynamicFiles = require('./serve-dynamic-files')
const validateAndGetServeStaticFiles = require('./serve-static-files')
const validateAndGetWrongRequestHandler = require('./wrong-request-handler')

const validateAndGetServerFeatures = {
  view: validateAndGetView,
  serverMiddlewares: validateAndGetServerMiddlewares,
  siteMiddlewares: validateAndGetSiteMiddlewares,
  serveDynamicFiles: validateAndGetServeDynamicFiles,
  serveStaticFiles: validateAndGetServeStaticFiles,
  wrongRequestHandler: validateAndGetWrongRequestHandler
}

function getServerFeatures (serverConfig) {
  const status = new Status()
  const serverFeatures = { apply: applyFeatures }

  for (const featureName in validateAndGetServerFeatures) {
    serverFeatures[featureName] = validateAndGetServerFeatures[featureName](
      serverConfig[featureName],
      status
    )
  }

  return status.error ? null : serverFeatures
}

module.exports = getServerFeatures

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

function applyFeatures (app) {
  const serverFeatureNames = Object.keys(validateAndGetServerFeatures)

  serverFeatureNames.forEach(featureName => {
    this[featureName].apply(app)
  })
}
