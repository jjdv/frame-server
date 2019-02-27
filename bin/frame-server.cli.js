#!/usr/bin/env node
'use strict';

const app = require('express')()

// get the final server configuration data
let serverConfig = require('../config/server.config')

// processConfigData changes file paths to absolute and creates respective middlewares
// it does sanity check, reports errors and, if errors are found, terminates the process
const processConfigData = require('../modules/process-config-data')
const { view } = serverConfig = processConfigData(serverConfig)

// put final reference dirs to process.env
process.env.serverRootDir = serverConfig.serverRootDir
process.env.siteRootDir = serverConfig.siteRootDir

// set views if defined
if (view) {
  if (view.engine) app.set('view engine', view.engine)
  if (view.dir) app.set('views', view.dir)
}

const middlewares = require('../middlewares/middlewares')
const { applyMiddleware } = require('../modules/helpers')

async function runServer() {
  const { serverMiddlewares, siteMiddlewares, serveDynamicFiles, serveStaticFiles, wrongRequestHandler } = await middlewares(serverConfig)

  // server middlewares
  serverMiddlewares.forEach(middleware => app.use(middleware))

  // deploy site middlewares defined for the site
  siteMiddlewares.forEach(middlewareDef => applyMiddleware(middlewareDef, app))

  // serve special files for defined route paths
  serveDynamicFiles.forEach(file => app.get(file.routePaths, file.handler))

  // serve static files from defined directories for defined route paths
  serveStaticFiles.forEach(dirMiddleware => applyMiddleware(dirMiddleware, app))

  // handle pure static files, limited to specified extensions, if defined
  app.use(wrongRequestHandler)

  const PORT = process.env.PORT || serverConfig.port
  app.listen(PORT, () => {
    const uriDesc = process.env.PORT ? `port: ${PORT}` : `http://localhost:${PORT}`
    console.log(`Server listening on ${uriDesc} ...`)
  })
}

runServer()
