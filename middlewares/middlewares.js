'use strict';

const getFilesRouter = require('../middlewares/files-router')
const getStaticRouter = require('../middlewares/static-router')

exports.middlewares = async function(serverConfig) {
    return {
        middlewares: await getMiddlewares(serverConfig),
        filesRouter: serverConfig.serveFileDef ? getFilesRouter(serverConfig) : null,
        staticRouter: getStaticRouter(serverConfig)
    }
}

const getServerMiddlewareDefs = exports.getServerMiddlewareDefs = async function(serverConfig) {
    if (!serverConfig.serverMiddlewares) serverConfig.serverMiddlewares = []
    const middlewares = serverConfig.serverMiddlewares
    const middlewareIds = await helmetCheckAndCorrect(serverConfig, middlewares)
    
    confirmServeMiddlewares(middlewareIds)

    return middlewares
}

//function fileHandler(filePath) {
    console.log(`Serving the file ${filePath.match(/\/[^\/]$/)[0]} for defined route paths.`)
    //return ((req, res) => res.sendFile(filePath))
//}


//-------------------------------------------------------------------------------
// supporting functions 
//-------------------------------------------------------------------------------

async function getMiddlewares(serverConfig) {
    const serverMiddlewares = await getServerMiddlewares(serverConfig)
    const siteMiddlewares = serverConfig.siteMiddlewares
    const siteMiddlewaresNo = siteMiddlewares && siteMiddlewares.length ? siteMiddlewares.length : 0
    console.log(`Number of site middlewares applied: ${siteMiddlewaresNo}.`)
    return serverConfig.siteMiddlewares ? serverMiddlewares.concat(siteMiddlewares) : serverMiddlewares
}

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

function middlewareDefIds(middlewares) {
    return middlewares.map(m => middlewareDefId(m) )
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
