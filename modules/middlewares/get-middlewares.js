'use strict'

const { serverMiddlewares } = require('./server')
const { siteMiddlewares } = require('./site')
const { dynamicFilesMiddlewares } = require('./dynamic-files')
const { staticFilesMiddlewares } = require('./static-files')
const { wrongRequestHandler } = require('./wrong-request-handler')

function getMiddlewares(config) {
  return {
    serverMiddlewares: serverMiddlewares(config.serverMiddlewares),
    siteMiddlewares: siteMiddlewares(config.siteMiddlewares),
    serveDynamicFiles: dynamicFilesMiddlewares(config.serveDynamicFiles),
    serveStaticFiles: staticFilesMiddlewares(config.serveStaticFiles),
    wrongRequestHandler: wrongRequestHandler(config.wrongRequestHandler)
  }
}

module.exports = getMiddlewares