
const Middleware = require('../modules/class-middleware')
const Middlewares = require('../modules/class-middlewares')

function validateSiteMiddlewares (siteMiddlewaresDef, status) {
  Middlewares.validate(siteMiddlewaresDef, validateSiteMiddleware, status)
}

function siteMiddlewares (siteMiddlewaresDef) {
  const siteMiddlewaresDir = process.env.siteMiddlewaresDir
  return Middlewares.fromDef('siteMiddlewares', siteMiddlewaresDef, { rootDir: siteMiddlewaresDir })
}

module.exports = { validateSiteMiddlewares, siteMiddlewares }

// -------------------------------------------------------------------------------
// supporting functions
// -------------------------------------------------------------------------------

function validateSiteMiddleware (siteMiddlewareDef, index, status) {
  if (typeof siteMiddlewareDef !== 'object') {
    siteMiddlewareDef = {
      middleware: siteMiddlewareDef,
      name: 'siteMiddlewares, item ' + (index + 1)
    }
  } else if (!siteMiddlewareDef.name || typeof siteMiddlewareDef.name !== 'string') {
    siteMiddlewareDef.name = 'siteMiddlewares, item ' + (index + 1)
  }

  const siteMiddlewaresDir = process.env.siteMiddlewaresDir
  Middleware.validateDef(siteMiddlewareDef, { rootDir: siteMiddlewaresDir }, status)
}
