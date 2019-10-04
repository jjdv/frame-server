const {
  Status,
  basicFunctions: { isEmpty },
  statusFunctions: { nameErr }
} = require('node-basic-helpers')
const Middleware = require('./middleware')

class Middlewares {
  constructor (middlewaresName, middlewaresDef, options, applyMsg) {
    this.middlewares = []
    if (nameErr(middlewaresName, 'middlewares group', middlewaresDef)) return

    const status = new Status()
    if (isEmpty(middlewaresDef)) {
      status.reportErr(
        'Invalid middlewares definition: ',
        middlewaresDef,
        `in the middleware '${middlewaresName}'.`
      )
    }

    this.name = middlewaresName
    this.applyMsg = applyMsg
    if (!Array.isArray(middlewaresDef)) middlewaresDef = [middlewaresDef]
    middlewaresDef.forEach((mDef, index) => {
      if (mDef.constructor !== Object) {
        mDef = {
          name: `${middlewaresName}-${index}`,
          middleware: mDef
        }
      } else if (!mDef.name) mDef.name = `${middlewaresName}-${index}`
      this.middlewares.push(new Middleware(mDef, options))
    })
  }

  apply (app, middlewareGroupReporting = true) {
    if (!app || isEmpty(this.middlewares)) return

    if (middlewareGroupReporting) {
      const mNames = this.middlewares.map(m => m.name)
      const applyMsg = this.applyMsg
        ? this.applyMsg
        : `The middlewares applied from the '${this.name}': `
      console.log(applyMsg, mNames)
    }

    const individualReporting = !middlewareGroupReporting
    this.middlewares.forEach(m => m.apply(app, individualReporting))
  }
}

module.exports = Middlewares
