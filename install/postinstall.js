'use strict';

const serverConfig = require('../config/server.config')
const { getServerMiddlewareDefs } = require('../modules/helpers')

async function installServerDependencies() {
    let serverMiddlewares = await getServerMiddlewareDefs(serverConfig)

    if (serverMiddlewares.length) {
        const { packageNames } = require('../modules/server-middleware.def')

        // get respective unique package names
        serverMiddlewares =  serverMiddlewares.map(mDef => packageNames[typeof mDef === 'string' ? mDef : mDef.name])
        for (let i=0; i<serverMiddlewares.length; i++) {
            if (serverMiddlewares.indexOf(serverMiddlewares[i], i+1) != -1) serverMiddlewares.splice(i--, 1)
        }

        // install server middleware dependencies if any
        if (serverMiddlewares.length) installMiddlewares(serverMiddlewares)
        else console.log('No middleware was requested for installation.')
    }
}

installServerDependencies()


//-------------------------------------------------------------------------------
// supporting functions 
//-------------------------------------------------------------------------------

function installMiddlewares(serverMiddlewares) {
    const { spawn } = require('child_process')
    const spawnArgs = ['install', '--save'].concat(serverMiddlewares)
    const spawnOptions = {shell: process.platform == 'win32'}
    const child = spawn('npm', spawnArgs, spawnOptions)

    child.stdout.setEncoding('utf8')
    child.stdout.on('data', data => console.log(data))

    child.stderr.setEncoding('utf8')
    child.stderr.on('data', data => console.error(data))
}
