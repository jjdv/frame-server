const { createGetOnlyProps, createReadOnlyProps } = require('../helpers/object')
const Status = require('./status')
const { isEmpty, routePathsErr, nameErr } = require('../helpers/basic')
const {
  middlewareMock,
  middlewareDefToArgs,
  middlewareFnErrCheck,
  middlewareTypeErrCheck,
  middlewareFnFromDef
} = require('../helpers/middleware')

function Middleware(middlewareDef, options = {}) {
  const status = new Status()

  if (isEmpty(middlewareDef)) {
    status.reportErr('A siteMiddleware definition cannot be empty.')
    for (prop in middlewareMock) {
      this[prop] = middlewareMock[prop]
    }
    return
  }

  const [middlewareName, middlewareFn, routePaths, type] = middlewareDefToArgs(
    middlewareDef,
    options
  )

  nameErr(middlewareName, 'middleware', middlewareDef, status)
  middlewareFnErrCheck(middlewareFn, middlewareName, status)
  if (routePaths) routePathsErr(routePaths, middlewareName, status)
  middlewareTypeErrCheck(type, middlewareName, status)

  if (status.error) {
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
