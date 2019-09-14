const Status = require('./status')
const { isEmpty } = require('../helpers/basic')
const { middlewareMock, middlewareDefToArgs } = require('./helpers/middleware')

class Middleware {
  constructor (middlewareDef, options = {}, status = new Status()) {
    if (
      !middlewareDef ||
      middlewareDef.constructor !== Object ||
      isEmpty(middlewareDef)
    ) {
      status.reportErr('Invalid middleware definition: ', middlewareDef)
      return middlewareMock
    }

    const [
      middlewareName,
      middlewareFn,
      routePaths,
      type
    ] = middlewareDefToArgs(middlewareDef, options, status)

    this.name = middlewareName
    if (status.error) this.middlewareFn = null
    else {
      this.middlewareFn = middlewareFn
      this.routePaths = routePaths
      this.type = type
    }
  }

  apply (app, report = true) {
    if (!(app instanceof Function) || !(this.middlewareFn instanceof Function))
      return

    if (this.routePaths) app[this.type](this.routePaths, this.middlewareFn)
    else app[this.type](this.middlewareFn)
    if (report) console.log(`The middleware '${this.name}' has been applied.`)
  }
}

module.exports = Middleware
