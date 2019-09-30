const {
  Status,
  basicFunctions: { isEmpty },
  statusFunctions: { nameErr }
} = require('node-basic-helpers')
const Middleware = require('./middleware')

//   if (middlewaresArgsErr(middlewaresName, middlewares, applyMsg)) return

class Middlewares {
  constructor (middlewaresName, middlewaresDef, options, applyMsg) {
    const status = new Status()

    if (nameErr(middlewaresName, 'middlewares group', middlewares)) return
    if (isEmpty(middlewaresDef)) {
      status.reportErr(
        'Invalid middlewares definition: ',
        middlewaresDef,
        `in the middleware '${middlewaresName}'.`
      )
    }

    const middlewares = []
    if (!Array.isArray(middlewaresDef)) middlewaresDef = [middlewaresDef]
    middlewaresDef.forEach((mDef, index) => {
      if (mDef.constructor !== Object) {
        mDef = {
          name: `${middlewaresName}-${index}`,
          middleware: mDef
        }
      } else if (!mDef.name) mDef.name = `${middlewaresName}-${index}`
      middlewares.push(new Middleware(mDef, options))
    })

    this.name = middlewaresName
    this.middlewares = middlewares
    this.applyMsg = applyMsg
  }

  apply (app, groupReporting = true) {
    if (!app || isEmpty(this.middlewares)) return

    const individualReporting = !groupReporting
    if (groupReporting) {
      const mNames = this.middlewares.map(m => m.name)
      const applyMsg = this.applyMsg
        ? this.applyMsg
        : `The middlewares applied from the '${this.name}': `
      console.log(applyMsg, mNames)
    }
    this.middlewares.forEach(m => m.apply(app, individualReporting))
  }
}

module.exports = Middlewares
