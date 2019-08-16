const { createGetOnlyProps, createReadOnlyProps } = require('../helpers/object')
const Status = require('./status')
const { isEmpty } = require('../helpers/basic')
const {
  middlewareMock,
  middlewareDefToArgs,
  middlewareArgsErr,
  middlewareFnFromDef
} = require('../helpers/middleware')

function Middleware(middlewareDef, options = {}) {
  if (isEmpty(middlewareDef)) {
    new Status().reportErr('A siteMiddleware definition cannot be empty.')
    for (prop in middlewareMock) {
      this[prop] = middlewareMock[prop]
    }
    return
  }

  const [middlewareName, middlewareFn, routePaths, type] = middlewareDefToArgs(
    middlewareDef,
    options
  )
  if (middlewareArgsErr(middlewareName, middlewareFn, routePaths, type)) {
    this.name = middlewareName
    this.middlewareFn = null
  } else {
    createReadOnlyProps(this, { middlewareFn })
    createGetOnlyProps(this, { name: middlewareName, routePaths, type })
  }
}

Middleware.prototype.apply = function(app, report = true) {
  if (!app || app.constructor !== Function || !this.middlewareFn) return

  if (this.routePaths) app[this.type](this.routePaths, this.middlewareFn)
  else app[this.type](this.middlewareFn)
  if (report) console.log(`The middleware '${this.name}' has been applied.`)
}

module.exports = Middleware
