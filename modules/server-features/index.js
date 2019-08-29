const { validateViewConfig, getView } = require('./view')
const {
  validateServerMiddlewaresConfig,
  getServerMiddlewares
} = require('./server-middlewares')
const {
  validateSiteMiddlewaresConfig,
  getSiteMiddlewares
} = require('./site-middlewares')
const {
  validateServeDynamicFilesConfig,
  getServeDynamicFiles
} = require('./serve-dynamic-files')
const {
  validateServeStaticFilesConfig,
  getServeStaticFiles
} = require('./serve-static-files')
const {
  validateWrongRequestHandlerConfig,
  getWrongRequestHandler
} = require('./wrong-request-handler')

const serverFeatureNames = [
  'view',
  'serverMiddlewares',
  'siteMiddlewares',
  'serveDynamicFiles',
  'serveStaticFiles',
  'wrongRequestHandler'
]

const validateFeatureConfig = {
  view: validateViewConfig,
  serverMiddlewares: validateServerMiddlewaresConfig,
  siteMiddlewares: validateSiteMiddlewaresConfig,
  serveDynamicFiles: validateServeDynamicFilesConfig,
  serveStaticFiles: validateServeStaticFilesConfig,
  wrongRequestHandler: validateWrongRequestHandlerConfig
}

const getFeature = {
  view: getView,
  serverMiddlewares: getServerMiddlewares,
  siteMiddlewares: getSiteMiddlewares,
  serveDynamicFiles: getServeDynamicFiles,
  serveStaticFiles: getServeStaticFiles,
  wrongRequestHandler: getWrongRequestHandler
}

function validateAndGetServerFeatures (serverConfig) {
  const Status = require('../classes/status')
  const status = new Status()
  const serverFeatures = { apply: applyFeatures }

  serverFeatureNames.forEach(featureName => {
    serverFeatures[featureName] = validateAndGetServerFeature(
      serverConfig,
      featureName,
      status
    )
  })

  return status.error ? null : serverFeatures
}

module.exports = validateAndGetServerFeatures

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

function validateAndGetServerFeature (serverConfig, featureName, status) {
  const featureConfig = serverConfig[featureName]
  if (featureConfig) {
    validateFeatureConfig[featureName](featureConfig, status)
    if (!status.error) return getFeature[featureName](featureConfig)
  }
  return null
}

function applyFeatures (app) {
  serverFeatureNames.forEach(featureName => {
    this[featureName].apply(app)
  })
}
