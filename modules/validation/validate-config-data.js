'use strict'

const { filePath, filePathNotEmpty } = require('../helpers/basic')
const Status = require('../classes/status')

module.exports = function validateConfigData (config) {
  const serverRootDir = config.serverRootDir
  const validationStatus = new Status()

  // serverRootDir check
  process.env.SERVER_ROOT_DIR = validatePath('serverRootDir', serverRootDir, null, validationStatus)
  if (!process.env.SERVER_ROOT_DIR) return null

  // siteRootDir changed into absolute path and done validity check
  process.env.SITE_ROOT_DIR = validatePath('siteRootDir', config.siteRootDir, serverRootDir, validationStatus)
  if (!process.env.SITE_ROOT_DIR) return null

  // view check
  if (config.view) validateView(config.view, validationStatus)

  // noHelmet check
  if (typeof config.noHelmet !== 'boolean') validationStatus.reportErr("The 'noHelmet' parameter in the server config file is not boolean but:", config.noHelmet)

  // serverMiddlewares check
  if (config.serverMiddlewares) {
    const { validateServerMiddlewares } = require('../middlewares/server')
    validateServerMiddlewares(config.serverMiddlewares, config.noHelmet, validationStatus)
  }

  // siteMiddlewares check
  if (config.siteMiddlewares) {
    const siteMiddlewaresDir = config.siteMiddlewaresDir && filePath(config.siteMiddlewaresDir, serverRootDir, 'siteMiddlewaresDir', validationStatus)
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
    const { validateWrongRequestHandlerDef } = require('../middlewares/wrong-request-handler')
    validateWrongRequestHandlerDef(config.wrongRequestHandler, validationStatus)
  }

  // port check
  if (!Number.isInteger(config.port)) validationStatus.reportErr('Provided port is not an integer but: ', config.port)

  if (validationStatus.error) {
    console.log('Detected errors in the server configuration file. Server initialization aborted.')
    return null
  }
  return config
}

//
// -------------------------------------------------------------------------------
// supporting functions
// -------------------------------------------------------------------------------

const path = require('path')
const fs = require('fs')

function validatePath (dirName, dir, rootDir, status) {
  if (!dir) status.reportErr(`Missing '${dirName}'.`)
  else if (typeof dir !== 'string') status.reportErr(`Wrong format of '${dirName}': ${dir}.`)
  else {
    if (rootDir) dir = path.resolve(rootDir, dir)
    if (!fs.existsSync(dir)) status.reportErr(`Cannot find "${dir}" specified in ${dirName}.`)
  }

  return status.error ? null : dir
}

function validateView (view, processStatus) {
  if (view.constructor !== Object) processStatus.reportErr('Wrong format of the view definition in the server config file:', view)
  if (view.engine && typeof view.engine !== 'string') processStatus.reportErr('view.engine in the server config file must be a string, not: ', view.engine)
  if (view.dir) {
    const serverRootDir = process.env.SERVER_ROOT_DIR
    if (typeof view.dir === 'string') filePathNotEmpty(view.dir, serverRootDir, 'view.dir', processStatus)
    else if (Array.isArray(view.dir)) view.dir.forEach(dir => filePathNotEmpty(dir, serverRootDir, 'view.dir', processStatus))
    else processStatus.reportErr('view.dir in the server config file must be a string or an array, not: ', view.dir)
  }
}
