#!/usr/bin/env node
'use strict';

const app = require('express')()

const serverConfig = getServerConfig()

// set views if defined
setView(serverConfig.view)

const { middlewares } = require('../middlewares/middlewares')
const { serverMiddlewares, siteMiddlewares, serveDynamicFiles, serveStaticFiles, wrongRequestHandler } = middlewares(serverConfig)

// server middlewares
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
const PORT = process.env.PORT || serverConfig.port
const uriDesc = process.env.PORT ? `port: ${PORT}` : `http://localhost:${PORT}`
app.listen(PORT, () => console.log(`Server listening on ${uriDesc} ...`))


//-------------------------------------------------------------------------------
// supporting functions 
//-------------------------------------------------------------------------------

function getServerConfig() {
  // get the final server configuration data
  serverConfig = require('../config/server.config')
  
  try {
    // 'validateConfigData' validates data, changes file paths to absolute,
    // reports errors and throws an error if there are any errors found
    const validateConfigData = require('../modules/validate-config-data')
    return validateConfigData(serverConfig)
  } catch (e) {
    console.error(e.toString())
    process.exit(9)
  }
}

function setView(view) {
  if (!view) return
  if (view.engine) app.set('view engine', view.engine)
  if (view.dir) app.set('views', view.dir)
}
