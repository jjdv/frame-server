const Status = require('./status')
const { isEmpty } = require('../helpers/basic')
const { routePathsErr, nameErr } = require('../helpers/validators')
const {
  middlewareMock,
  middlewareDefToArgs,
  middlewareFnErrCheck,
  middlewareTypeErrCheck
} = require('../helpers/middleware')

class Middleware {
  constructor (mDef, options = {}) {
    const status = new Status()

    if (!mDef || mDef.constructor !== Object || isEmpty(mDef)) {
      status.reportErr('Invalid middleware definition: ', mDef)
      for (const prop in middlewareMock) this[prop] = middlewareMock[prop]
      return
    }

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

  apply (app, report = true) {
    if (!app || !this.middlewareFn) return

    if (this.routePaths) app[this.type](this.routePaths, this.middlewareFn)
    else app[this.type](this.middlewareFn)
    if (report) console.log(`The middleware '${this.name}' has been applied.`)
  }
}

module.exports = Middleware
