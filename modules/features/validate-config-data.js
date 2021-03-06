'use strict'

const {
  Status,
  statusFunctions: { validatedDirectory, filePathValidated }
} = require('node-basic-helpers')
const { validateViewConfig } = require('./view')

module.exports = function validateConfigData (config) {
  const rootDir = config.rootDir
  const validationStatus = new Status()

  // rootDir check
  process.env.APP_ROOT_DIR = validatedDirectory(
    rootDir,
    'rootDir',
    null,
    validationStatus
  )
  if (!process.env.APP_ROOT_DIR) return null

  // siteRootDir changed into absolute path and done validity check
  process.env.SITE_ROOT_DIR = validatedDirectory(
    config.siteRootDir,
    'siteRootDir',
    rootDir,
    validationStatus
  )
  if (!process.env.SITE_ROOT_DIR) return null

  // view check
  if (config.view) validateViewConfig(config.view, validationStatus)

  // noHelmet check
  if (typeof config.noHelmet !== 'boolean') {
    validationStatus.reportErr(
      "The 'noHelmet' parameter in the server config file is not boolean but:",
      config.noHelmet
    )
  }

  // serverMiddlewares check
  if (config.serverMiddlewares) {
    const { validateServerMiddlewares } = require('./server-middlewares')
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
      filePathValidated(
        config.siteMiddlewaresDir,
        'siteMiddlewaresDir',
        rootDir,
        validationStatus
      )
    process.env.SITE_MIDDLEWARES_DIR = siteMiddlewaresDir || rootDir

    const { validateSiteMiddlewares } = require('./site-middlewares')
    validateSiteMiddlewares(config.siteMiddlewares, validationStatus)
  }

  // serveDynamicFiles check
  if (config.serveDynamicFiles) {
    const { validateDynamicFilesDef } = require('./serve-dynamic-files')
    validateDynamicFilesDef(config.serveDynamicFiles, validationStatus)
  }

  // serveStaticFiles check
  if (config.serveStaticFiles) {
    const { validateStaticFilesDef } = require('./serve-static-files')
    validateStaticFilesDef(config.serveStaticFiles, validationStatus)
  }

  // wrongRequestHandler check
  if (config.wrongRequestHandler) {
    const {
      validateWrongRequestHandlerDef
    } = require('./wrong-request-handler')
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
