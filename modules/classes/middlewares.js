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
    this.name = middlewaresName

    const status = new Status()
    if (isEmpty(middlewaresDef)) {
      status.reportErr(
        'Invalid middlewares definition: ',
        middlewaresDef,
        `in the middleware '${middlewaresName}'.`
      )
      return
    }

    this.applyMsg = applyMsg
    if (!Array.isArray(middlewaresDef)) middlewaresDef = [middlewaresDef]
    middlewaresDef.forEach((mDef, index) => {
      if (!mDef) return
      if (typeof mDef !== 'object' || mDef.constructor !== Object) {
        mDef = {
          name: `${middlewaresName}-element${index + 1}`,
          middleware: mDef
        }
      } else if (!mDef.name)
        mDef.name = `${middlewaresName}-element${index + 1}`
      this.middlewares.push(new Middleware(mDef, options))
    })
  }

  apply (app, middlewareGroupReporting = true) {
    if (!(app instanceof Function) || isEmpty(this.middlewares)) return

    const individualReporting = !middlewareGroupReporting
    this.middlewares.forEach(m => m.apply(app, individualReporting))

    if (middlewareGroupReporting) {
      const mNames = this.middlewares.map(m => m.name).join('\n')
      const applyMsg = this.applyMsg
        ? this.applyMsg
        : `The middlewares applied from the '${this.name}':\n`
      console.log(applyMsg, mNames)
    }
  }
}

module.exports = Middlewares
