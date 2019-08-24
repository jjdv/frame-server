'use strict'

const { validatedDirectory, validateView } = require('../helpers/validators')
const { filePath } = require('../helpers/basic')
const Status = require('../classes/status')

module.exports = function validateConfigData (config) {
  const serverRootDir = config.serverRootDir
  const validationStatus = new Status()

  // serverRootDir check
  process.env.SERVER_ROOT_DIR = validatedDirectory(
    'serverRootDir',
    serverRootDir,
    null,
    validationStatus
  )
  if (!process.env.SERVER_ROOT_DIR) return null

  // siteRootDir changed into absolute path and done validity check
  process.env.SITE_ROOT_DIR = validatedDirectory(
    'siteRootDir',
    config.siteRootDir,
    serverRootDir,
    validationStatus
  )
  if (!process.env.SITE_ROOT_DIR) return null

  // view check
  if (config.view) validateView(config.view, validationStatus)

  // noHelmet check
  if (typeof config.noHelmet !== 'boolean') {
    validationStatus.reportErr(
      "The 'noHelmet' parameter in the server config file is not boolean but:",
      config.noHelmet
    )
  }

  // serverMiddlewares check
  if (config.serverMiddlewares) {
    const { validateServerMiddlewares } = require('../middlewares/server')
    validateServerMiddlewares(
      config.serverMiddlewares,
      config.noHelmet,
      validationStatus
    )
  }

  // siteMiddlewares check
  if (config.siteMiddlewares) {
    const siteMiddlewaresDir =
      config.siteMiddlewaresDir &&
      filePath(
        config.siteMiddlewaresDir,
        serverRootDir,
        'siteMiddlewaresDir',
        validationStatus
      )
    process.env.SITE_MIDDLEWARES_DIR = siteMiddlewaresDir || serverRootDir

    const { validateSiteMiddlewares } = require('../middlewares/site')
    validateSiteMiddlewares(config.siteMiddlewares, validationStatus)
  }

  // serveDynamicFiles check
  if (config.serveDynamicFiles) {
    const { validateDynamicFilesDef } = require('../middlewares/dynamic-files')
    validateDynamicFilesDef(config.serveDynamicFiles, validationStatus)
  }

  // serveStaticFiles check
  if (config.serveStaticFiles) {
    const { validateStaticFilesDef } = require('../middlewares/static-files')
    validateStaticFilesDef(config.serveStaticFiles, validationStatus)
  }

  // wrongRequestHandler check
  if (config.wrongRequestHandler) {
    const {
      validateWrongRequestHandlerDef
    } = require('../middlewares/wrong-request-handler')
    validateWrongRequestHandlerDef(config.wrongRequestHandler, validationStatus)
  }

  // port check
  if (!Number.isInteger(config.port)) {
    validationStatus.reportErr(
      'Provided port is not an integer but: ',
      config.port
    )
  }

  if (validationStatus.error) {
    console.log(
      'Detected errors in the server configuration file. Server initialization aborted.'
    )
    return null
  }
  return config
}
