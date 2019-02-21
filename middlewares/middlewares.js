'use strict';

async function getMiddlewares(serverConfig) {
    const serverMiddlewares = await getServerMiddlewares(serverConfig)
    return serverConfig.siteMiddlewares ? serverMiddlewares.concat(serverConfig.siteMiddlewares) : serverMiddlewares
}

async function getServerMiddlewareDefs(serverConfig) {
    if (!serverConfig.serverMiddlewares) serverConfig.serverMiddlewares = []
    const middlewares = serverConfig.serverMiddlewares
    const middlewareIds = helmetCheckAndCorrect(serverConfig, middlewares)
    
    confirmServeMiddlewares(middlewareIds)

    return middlewares
}

module.exports = { getMiddlewares, getServerMiddlewareDefs }


//-------------------------------------------------------------------------------
// supporting functions 
//-------------------------------------------------------------------------------

async function getServerMiddlewares(serverConfig) {
    const { getServerMiddleware } = require('./server-middleware.def')
    const serverMiddlewares = await getServerMiddlewareDefs(serverConfig)

    return serverMiddlewares.map(mDef => getServerMiddleware(mDef))
}

async function helmetCheckAndCorrect(serverConfig, middlewares) {
    const middlewareIds = middlewareDefIds(middlewares)
    const helmetIndex = middlewareIds.indexOf('helmet')

    if (helmetIndex == -1) {
        if (!serverConfig.noHelmet && !process.argv.includes('--no-helmet') && await addHelmet()) {
            return middlewares.unshift('helmet')
        }
    } else if (helmetIndex > 0) {
        middlewares.splice(helmetIndex, 1).concat(middlewares)
        console.log("The 'helmet' middleware should be first on the middleware list. It's corrected for this session but please correct it also in your server configuration file.")
    }

    return middlewareIds
}

function middlewareDefId(mDef) {
    const { validServerMiddlewareIds } = require('./server-middleware.def')

    if (typeof mDef === 'string') {
        if (!validServerMiddlewareIds.includes(mDef)) exit('Error: Invalid server middleware id:', mDef)

        return mDef
    }
    if (
        typeof mDef !== 'object' || mDef.constructor !== Object ||
        !mDef.name || !validServerMiddlewareIds.includes(mDef.name)
    ) exit('Error: Invalid server middleware definition:', mDef)

    return mDef.name
}

function middlewareDefIds(middlewares) {
    return middlewares.map(m => middlewareDefId(m) )
}

function addHelmet() {
    return new Promise(resolve => {
        const rl = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question("Do you want to add the security package 'helmet', recommended for production server? (y/n): ", answer => {
            resolve(answer.toLowerCase() == 'y')
            rl.close()
        });
    })
}

function confirmServeMiddlewares(middlewareIds) {
    if (middlewareIds.length)
        console.log('The following server middlewares are accepted for use:', middlewareIds.join(', ') + '.')
    else console.log('No server middlewares were defined for implementation.')
}
