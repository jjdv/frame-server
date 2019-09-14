'use strict'

const { serverMiddlewares } = require('./server-middlewares')
const { siteMiddlewares } = require('./site-middlewares')
const { dynamicFilesMiddlewares } = require('./serve-dynamic-files')
const { staticFilesMiddlewares } = require('./serve-static-files')
const { wrongRequestHandler } = require('./wrong-request-handler')

function getMiddlewares (config) {
  return {
    serverMiddlewares: serverMiddlewares(config.serverMiddlewares),
    siteMiddlewares: siteMiddlewares(config.siteMiddlewares),
    serveDynamicFiles: dynamicFilesMiddlewares(config.serveDynamicFiles),
    serveStaticFiles: staticFilesMiddlewares(config.serveStaticFiles),
    wrongRequestHandler: wrongRequestHandler(config.wrongRequestHandler)
  }
}

module.exports = getMiddlewares
