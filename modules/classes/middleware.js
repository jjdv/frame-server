const { createGetOnlyProps, createReadOnlyProps } = require('../helpers/object')
const Status = require('./status')
const { isEmpty } = require('../helpers/basic')
const {
  middlewareMock,
  middlewareArgsErr,
  middlewareFnFromDef
} = require('../helpers/middleware')

function Middleware(middlewareName, middlewareFn, routePaths, type = 'use') {
  if (middlewareArgsErr(middlewareName, middlewareFn, routePaths, type)) {
    this.name = middlewareName
    this.middlewareFn = null
  } else {
    createReadOnlyProps(this, { middlewareFn })
    createGetOnlyProps(this, { name: middlewareName, routePaths, type })
  }
}

Middleware.defToArgs = function(middlewareDef, options = {}) {
  const { rootDir, defaultType } = options
  if (typeof middlewareDef !== 'object')
    middlewareDef = { middleware: middlewareDef }
  const {
    name: middlewareName,
    middleware: middlewareFnDef,
    routePaths
  } = middlewareDef
  const middlewareFn = middlewareFnFromDef(
    middlewareFnDef,
    middlewareName,
    rootDir
  )
  const type = middlewareDef.type ? middlewareDef.type : defaultType || 'use'

  return [middlewareName, middlewareFn, routePaths, type]
}

Middleware.fromDef = function(middlewareDef, options) {
  if (isEmpty(middlewareDef)) {
    new Status().reportErr('A siteMiddleware definition cannot be empty.')
    return middlewareMock
  }

  const mArgs = Middleware.defToArgs(middlewareDef, options)
  return new Middleware(...mArgs)
}

Middleware.prototype.apply = function(app, report = true) {
  if (!app || app.constructor !== Function || !this.middlewareFn) return

  if (this.routePaths) app[this.type](this.routePaths, this.middlewareFn)
  else app[this.type](this.middlewareFn)
  if (report) console.log(`The middleware '${this.name}' has been applied.`)
}

module.exports = Middleware
