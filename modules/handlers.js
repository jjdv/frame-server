'use strict';

const { getMiddlewares } = require('../middlewares/middlewares')
const getFilesRouter = require('../middlewares/files-router')
const getStaticRouter = require('../middlewares/static-router')

module.exports = async function(serverConfig) {
    return {
        middlewares: await getMiddlewares(serverConfig),
        filesRouter: serverConfig.serveFileDef ? getFilesRouter(serverConfig) : null,
        staticRouter: getStaticRouter(serverConfig)
    }
}
