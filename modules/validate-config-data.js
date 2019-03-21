'use strict'

const path = require('path')
const fs = require('fs')

const { filePath, filePathNotEmpty } = require('./helpers-basic')
const Status = require('./class-status')

module.exports = function validateConfigData (config) {
  const serverRootDir = config.serverRootDir
  const validationStatus = new Status()

  // serverRootDir check
  process.env.serverRootDir = processRequiredDir('serverRootDir', serverRootDir)

  // siteRootDir changed into absolute path and done validity check
  process.env.siteRootDir = processRequiredDir('siteRootDir', config.siteRootDir, serverRootDir)

  // view check
  if (config.view) processView(config.view, validationStatus)

  // noHelmet check
  if (typeof config.noHelmet !== 'boolean') validationStatus.reportErr("The 'noHelmet' parameter in the server config file is not boolean but:", config.noHelmet)

  // serverMiddlewares check
  const { validateServerMiddlewares } = require('../middlewares/server')
  validateServerMiddlewares(config.serverMiddlewares, config.noHelmet, validationStatus)

  // siteMiddlewares check
  const siteMiddlewaresDir = filePath(config.siteMiddlewaresDir, serverRootDir, 'siteMiddlewaresDir', validationStatus)
  process.env.siteMiddlewaresDir = siteMiddlewaresDir || serverRootDir

  const { validateSiteMiddlewares } = require('../middlewares/site')
  validateSiteMiddlewares(config.siteMiddlewares, validationStatus)

  // serveDynamicFiles check
  const { validateDynamicFilesDef } = require('../middlewares/dynamic-files')
  validateDynamicFilesDef(config.serveDynamicFiles, validationStatus)

  // serveStaticFiles check
  const { validateStaticFilesDef } = require('../middlewares/static-files')
  validateStaticFilesDef(config.serveStaticFiles, validationStatus)

  // wrongRequestHandler check
  const { validateWrongRequestHandlerDef } = require('../middlewares/wrong-request-handler')
  validateWrongRequestHandlerDef(config.wrongRequestHandler, validationStatus)

  // port check
  if (!Number.isInteger(config.port)) validationStatus.reportErr('Provided port is not an integer but: ', config.port)

  if (validationStatus.error) throw new Error('Detected errors in the server configuration file. Server initialization aborted.')
}

// -------------------------------------------------------------------------------
// supporting functions
// -------------------------------------------------------------------------------

function processRequiredDir (dirName, dir, rootDir) {
  if (!dir) throw new Error(`Missing '${dirName}'.`)
  else if (typeof dir !== 'string') throw new Error(`Wrong format of '${dirName}': ${dir}.`)
  else {
    if (rootDir) dir = path.resolve(rootDir, dir)
    if (!fs.existsSync(dir)) throw new Error(`Cannot find "${dir}" specified in ${dirName}.`)
  }

  return dir
}

function processView (view, processStatus) {
  if (view.constructor !== Object) processStatus.reportErr('Wrong format of the view definition in the server config file:', view)
  if (view.engine && typeof view.engine !== 'string') processStatus.reportErr('view.engine in the server config file must be a string, not: ', view.engine)
  if (view.dir) {
    const serverRootDir = process.env.serverRootDir
    if (typeof view.dir === 'string') filePathNotEmpty(view.dir, serverRootDir, 'view.dir', processStatus)
    else if (Array.isArray(view.dir)) view.dir.forEach(dir => filePathNotEmpty(dir, serverRootDir, 'view.dir', processStatus))
    else processStatus.reportErr('view.dir in the server config file must be a string or an array, not: ', view.dir)
  }
}
