'use strict'

const Middlewares = require('../classes/middlewares')

function validateServerMiddlewares(serverMiddlewares, noHelmet, status) {
  if (!serverMiddlewares) return
  if (typeof serverMiddlewares === 'string')
    serverMiddlewares = [serverMiddlewares]
  else if (!Array.isArray(serverMiddlewares)) {
    status.reportErr(
      "The value of 'serverMiddlewares' is not a string nor an array but is: ",
      serverMiddlewares
    )
    return
  }

  const serverMiddlewareNames = serverMiddlewares.map(mDef =>
    typeof mDef === 'object' ? mDef.name : mDef
  )
  checkHelmet(serverMiddlewareNames, noHelmet, status)
  checkPackageValidity(serverMiddlewareNames, status)
}

const packageNames = {
  helmet: 'helmet',
  cookies: 'cookie-parser',
  session: 'express-session',
  json: 'express',
  urlencoded: 'express',
  multipart: 'multer'
}

function serverMiddlewares(serverMiddlewaresDef) {
  serverMiddlewaresDef = serverMiddlewaresDef.map(mDef =>
    getServerMiddleware(mDef)
  )
  return Middlewares.fromDef('serverMiddlewares', serverMiddlewaresDef)
}

module.exports = { validateServerMiddlewares, packageNames, serverMiddlewares }

// -----------------------------------------------------------------------
// supporting functions
// -----------------------------------------------------------------------

function checkHelmet(serverMiddlewareNames, noHelmet, status) {
  const helmetIndex = serverMiddlewareNames.indexOf('helmet')

  if (helmetIndex === -1) {
    if (!noHelmet && !process.argv.includes('--no-helmet')) {
      console.warn(
        "No 'helmet' middleware request found in the server configuration file. This middleware is strongly recommended in production."
      )
    }
  } else if (helmetIndex > 0) {
    status.reportErr(
      "The 'helmet' middleware should be first on the middleware list. It's corrected for this session but please correct it also in your server configuration file."
    )
  }
}

function checkPackageValidity(serverMiddlewareNames, status) {
  serverMiddlewareNames.forEach(mName => {
    if (!packageNames[mName])
      status.reportErr('Invalid server middleware specification: ', mName)
  })
}

function getServerMiddleware(mDef) {
  const isMDefStr = typeof mDef === 'string'
  const mId = isMDefStr ? mDef : mDef.name
  const mOptions = isMDefStr ? {} : mDef.options
  const m = require(packageNames[mId])

  return {
    name: mId,
    middleware: getServerMiddlewareFn[mId](m, mOptions)
  }
}

const getServerMiddlewareFn = {
  helmet: (m, options) => m(options),
  json: (m, options) => m.json(options),
  urlencoded: (m, options) => m.urlencoded(options),
  multipart: (m, options) => m(options).array(),
  cookies: (m, options) => m(options),
  session: (m, options) => m(options)
}
