'use strict'

let { installServerMiddlewares, serverMiddlewares } = require('../config/server.config')

if (installServerMiddlewares && serverMiddlewares) {
  if (typeof serverMiddlewares === 'string') serverMiddlewares = [ serverMiddlewares ]
  if (Array.isArray(serverMiddlewares)) {
    const { packageNames } = require('../middlewares/server-middlewares.def')

    const externalPackages = []; let mName
    for (let mDef of serverMiddlewares) {
      if (!mDef) continue
      switch (typeof mDef) {
        case 'string': mName = mDef; break
        case 'object': mName = typeof mDef.name === 'string' ? mDef.name : ''; break
        default: continue
      }
      const packageName = packageNames[mName]
      if (packageName && packageName !== 'express') externalPackages.push(packageName)
    }

    // install server middleware dependencies if any
    if (externalPackages.length) installExternalPackages(externalPackages)
    else console.log('No server middleware external packages found in the server configuration file.')
  }
}

// -------------------------------------------------------------------------------
// supporting functions
// -------------------------------------------------------------------------------

function installExternalPackages (externalPackages) {
  console.log('The following server middleware external packages, found in the server configuration file, will be instaled: ', externalPackages.join(','))

  const { spawn } = require('child_process')
  const spawnArgs = ['install', '--save'].concat(externalPackages)
  const spawnOptions = { shell: process.platform === 'win32' }
  const child = spawn('npm', spawnArgs, spawnOptions)

  child.stdout.setEncoding('utf8')
  child.stdout.on('data', data => console.log(data))

  child.stderr.setEncoding('utf8')
  child.stderr.on('data', data => console.error(data))
}
