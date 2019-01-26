'use strict';

const serverConfig = require('../config/server.config.js')
const getLocalMiddleware = require('../modules/helpers')
const getFilesRouter = require('../routers/files-router')
const getStaticRouter = require('../routers/static-router')

module.exports = {
    middleware: serverConfig.siteMiddleware ? getLocalMiddleware(serverConfig.siteMiddleware) : null,
    filesRouter: serverConfig.serveFileDef ? getFilesRouter(serverConfig) : null,
    staticRouter: getStaticRouter(serverConfig)
}
  