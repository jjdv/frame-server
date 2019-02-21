'use strict';

const { getMiddlewares } = require('../middlewares/middlewares')
const getFilesRouter = require('../routers/files-router')
const getStaticRouter = require('../routers/static-router')

module.exports = async function(serverConfig) {
    return {
        middlewares: await getMiddlewares(serverConfig),
        filesRouter: serverConfig.serveFileDef ? getFilesRouter(serverConfig) : null,
        staticRouter: getStaticRouter(serverConfig)
    }
}
