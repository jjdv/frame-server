#!/usr/bin/env node
'use strict';

const app = require('express')()

let serverConfig = require('../config/server.config')
const processConfigData = require('../modules/process-config-data')

// if the config data are wrong, processConfigData reports errors and terminates the process
// also relative paths are changed into absolute and RegExp for file extensions is generated
serverConfig = processConfigData(serverConfig)

// set views if defined
if (serverConfig.view) {
  app.set('view engine', view.engine);
  app.set('views', view.dir);
}

async function runServer() {
  const handlers = require('../modules/handlers')
  const { middlewares, filesRouter, staticRouter } = await handlers(serverConfig)

  // deploy middleware/routers defined for the site
  if (middlewares.length) {
    app.use(middlewares)
  }

  // if defined, serve special file for defined paths or all paths except files with defined extensions
  if (filesRouter) {
    app.use( filesRouter )
  }

  // handle pure static files, limited to specified extensions, if defined
  app.get('*', staticRouter)

  // PORT in cloud and local deployments
  const PORT = process.env.PORT || serverConfig.port
  app.listen(PORT, () => {
    const uriDesc = process.env.PORT ? `port: ${PORT}` : `http://localhost:${PORT}`
    console.log(`Server listening on ${uriDesc} ...`)
  })
}

runServer()
