'use strict';

const serverConfig = require('../config/server.config')
const { getServerMiddlewareDefs } = require('../middlewares/middlewares')

async function installServerDependencies() {
    let serverMiddlewares = await getServerMiddlewareDefs(serverConfig)

    if (serverMiddlewares.length) {
        const { packageNames } = require('../middlewares/server-middleware.def')

        // get external package names
        const serverMiddlewareNames =  serverMiddlewares.map(mDef => packageNames[typeof mDef === 'string' ? mDef : mDef.name])
        for (let i=0; i<serverMiddlewareNames.length; i++) {
            if (serverMiddlewareNames[i] == 'express') serverMiddlewareNames.splice(i--, 1)
        }

        // install server middleware dependencies if any
        if (serverMiddlewareNames.length) installMiddlewares(serverMiddlewareNames)
        else console.log('No server middleware required installation.')
    }
}

installServerDependencies()


//-------------------------------------------------------------------------------
// supporting functions 
//-------------------------------------------------------------------------------

function installMiddlewares(serverMiddlewareNames) {
    const { spawn } = require('child_process')
    const spawnArgs = ['install', '--save'].concat(serverMiddlewareNames)
    const spawnOptions = {shell: process.platform == 'win32'}
    const child = spawn('npm', spawnArgs, spawnOptions)

    child.stdout.setEncoding('utf8')
    child.stdout.on('data', data => console.log(data))

    child.stderr.setEncoding('utf8')
    child.stderr.on('data', data => console.error(data))
}
