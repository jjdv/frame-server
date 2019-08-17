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

class Middleware {
  constructor(mDef, options = {}) {
    const status = new Status()

    if (isEmpty(mDef)) {
      status.reportErr('A siteMiddleware definition cannot be empty.')
      for (const prop in middlewareMock) {
        this[prop] = middlewareMock[prop]
      }
    } else {
      const [
        middlewareName,
        middlewareFn,
        routePaths,
        type
      ] = middlewareDefToArgs(mDef, options)

      nameErr(middlewareName, 'middleware', mDef, status)
      middlewareFnErrCheck(middlewareFn, middlewareName, status)
      if (routePaths) routePathsErr(routePaths, middlewareName, status)
      middlewareTypeErrCheck(type, middlewareName, status)

      this.name = middlewareName
      if (status.error) this.middlewareFn = null
      else {
        this.middlewareFn = middlewareFn
        this.routePaths = routePaths
        this.type = type
      }
    }
  }

  apply(app, report = true) {
    if (!app || app.constructor !== Function || !this.middlewareFn) return

    if (this.routePaths) app[this.type](this.routePaths, this.middlewareFn)
    else app[this.type](this.middlewareFn)
    if (report) console.log(`The middleware '${this.name}' has been applied.`)
  }
}

module.exports = Middleware
