const Middleware = require('../classes/middleware')
const Middlewares = require('../classes/middlewares')
const { validateDefs } = require('../helpers/middlewares')

function validateSiteMiddlewares (siteMiddlewaresDef, status) {
  validateDefs(siteMiddlewaresDef, validateSiteMiddleware, status)
}

function siteMiddlewares (siteMiddlewaresDef) {
  const siteMiddlewaresDir = process.env.SITE_MIDDLEWARES_DIR
  return new Middlewares('siteMiddlewares', siteMiddlewaresDef, {
    rootDir: siteMiddlewaresDir
  })
}

module.exports = { validateSiteMiddlewares, siteMiddlewares }

//
// -------------------------------------------------------------------------------
// supporting functions
// -------------------------------------------------------------------------------

function validateSiteMiddleware (siteMiddlewareDef, index, status) {
  if (typeof siteMiddlewareDef !== 'object') {
    siteMiddlewareDef = {
      middleware: siteMiddlewareDef,
      name: 'siteMiddlewares, item ' + (index + 1)
    }
  } else if (
    !siteMiddlewareDef.name ||
    typeof siteMiddlewareDef.name !== 'string'
  ) {
    siteMiddlewareDef.name = 'siteMiddlewares, item ' + (index + 1)
  }

  const siteMiddlewaresDir = process.env.SITE_MIDDLEWARES_DIR
  Middleware.validateDef(
    siteMiddlewareDef,
    { rootDir: siteMiddlewaresDir },
    status
  )
}
