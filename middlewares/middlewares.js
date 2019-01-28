'use strict';

module.exports = async function getMiddlewares(serverConfig) {
    const serverMiddlewares = await getServerMiddlewares(serverConfig)
    const localMiddleware = getLocalMiddleware(serverConfig)
    
    return localMiddleware ? serverMiddlewares.push(localMiddleware) : serverMiddlewares
}


//-------------------------------------------------------------------------------
// supporting functions 
//-------------------------------------------------------------------------------

const { getServerMiddlewareDefs } = require('../modules/helpers')
const { getServerMiddleware } = require('../modules/server-middleware.def')

async function getServerMiddlewares(serverConfig) {
    let serverMiddlewares = await getServerMiddlewareDefs(serverConfig)
    return serverMiddlewares.map(mDef => getServerMiddleware(mDef))
}

function getLocalMiddleware(serverConfig) {
    if (!serverConfig.siteMiddleware) return null

    const middleware = require(serverConfig.siteMiddleware)
    if (!middleware) exit('Error: siteMiddleware specified but not found in the given file.')
    if (typeof middleware !== 'function') exit('Error: Middleware definition is not a function.')

    console.log('Site middleware accepted for use.')
    return middleware
}
