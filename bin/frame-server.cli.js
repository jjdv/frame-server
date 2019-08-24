#!/usr/bin/env node
'use strict'

// find local server config and merge with ini config data
// if errors are found, they are reported and null is returned
let serverConfig = require('../config/server.config')
if (!serverConfig) process.exit()

// validate the config data
// if errors are found, they are reported and null is returned
const validateConfigData = require('../modules/validation/validate-config-data')
serverConfig = validateConfigData(serverConfig)
if (!serverConfig) process.exit()

const app = require('express')()

// set views if defined
if (serverConfig.view) {
  const setView = require('../modules/deployment/set-view')
  setView(app, serverConfig.view)
}

// get server middlewares
const getMiddlewares = require('../modules/middlewares/get-middlewares')
const {
  serverMiddlewares,
  siteMiddlewares,
  serveDynamicFiles,
  serveStaticFiles,
  wrongRequestHandler
} = getMiddlewares(serverConfig)

// deploy server middlewares
serverMiddlewares.apply(app)

// deploy site middlewares defined for the site
siteMiddlewares.apply(app)

// serve special files for defined route paths
serveDynamicFiles.apply(app)

// serve static files from defined directories for defined route paths
serveStaticFiles.apply(app)

// handle pure static files, limited to specified extensions, if defined
wrongRequestHandler.apply(app)

// start the server
const startServer = require('../modules/deployment/start-server')
startServer(app, serverConfig.port)
