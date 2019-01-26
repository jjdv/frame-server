#!/usr/bin/env node
'use strict';

const express = require('express')
const app = express()

// the process defined in './server.config.js' inspects config data and, if needed, reports errors and terminates server initialization
const { port } = require('../config/server.config.js')
const { middleware, filesRouter, staticRouter } = require('../modules/handlers.js')

// if defined, extra middleware/routers defined locally for the site
if (middleware) {
  app.use(middleware)
}

// if defined, special file served for defined paths or all paths except files with defined extensions
if (filesRouter) {
  app.use( filesRouter )
}

// handler of pure static files, limited to specified extensions if defined
app.get('*', staticRouter)

// PORT in cloud and local deployments
const PORT = process.env.PORT || port
app.listen(PORT, () => {
  const uriDesc = process.env.PORT ? `port: ${PORT}` : `localhost:${PORT}`
  console.log(`Server listening on ${uriDesc} ...`)
})
