'use strict';

const rootDir = process.env.INIT_CWD || process.cwd()

function exit(...errMsg) {
    console.error(...errMsg)
    process.exit(9)
}

async function getServerMiddlewareDefs(serverConfig) {
    if (!serverConfig.serverMiddlewares) serverConfig.serverMiddlewares = []
    const middlewares = serverConfig.serverMiddlewares
    
    const middlewareIds = middlewareDefIds(middlewares)
    const helmetIndex = middlewareIds.indexOf('helmet')
    if (helmetIndex == -1) {
        if (!serverConfig.noHelmet && !process.argv.includes('--no-helmet') && await addHelmet()) {
            middlewares.unshift('helmet')
            confirmServeMiddlewares(middlewares)
            return middlewares
        }
    } else if (helmetIndex > 0) {
        middlewares.splice(helmetIndex, 1).concat(middlewares)
        console.log("The 'helmet' middleware should be first on the middleware list. It's corrected for this session but please correct it also in your server configuration file.")
    }
    confirmServeMiddlewares(middlewares)
    return middlewares
}

const validServerMiddlewareIds = Object.keys(require('./server-middleware.def').packageNames)

module.exports = { rootDir, exit, getServerMiddlewareDefs, validServerMiddlewareIds }


//-------------------------------------------------------------------------------
// supporting functions 
//-------------------------------------------------------------------------------

function middlewareDefId(mDef) {
    if (typeof mDef === 'string') {
        if (!validServerMiddlewareIds.includes(mDef)) exit('Error: Invalid server middleware id: ', mDef)
        
        return mDef
    }
    if (
        typeof mDef !== 'object' || mDef.constructor !== Object ||
        !mDef.name || !validServerMiddlewareIds.includes(mDef.name)
    ) exit('Error: Invalid server middleware definition: ', mDef)

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
        console.log('The following server middlewares are accepted for use: ', middlewareIds.join(', '), '.')
    else console.log('No server middlewares were defined for implementation.')
}
