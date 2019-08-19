const { nameErr } = require('../helpers/basic')
const { createGetOnlyProps } = require('../helpers/object')
const Middleware = require('./middleware')
const Status = require('./status')

// function Middlewares(middlewaresName, middlewares, applyMsg) {
//   if (!Array.isArray(middlewares)) middlewares = [middlewares]
//   if (middlewaresArgsErr(middlewaresName, middlewares, applyMsg)) return

//   createGetOnlyProps(this, { name: middlewaresName, middlewares, applyMsg })
// }

class Middlewares {
  constructor(middlewaresName, middlewaresDef, options, applyMsg) {
    const status = new Status()

    if (nameErr(middlewaresName, 'middlewares group', middlewares, status))
      return null

    if (!Array.isArray(middlewaresDef)) middlewaresDef = [middlewaresDef]
    const middlewares = []
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

  apply(app, groupReporting = true) {
    if (!app || !this.middlewares) return

    const individualReporting = !groupReporting
    if (Array.isArray(this.middlewares)) {
      if (groupReporting) {
        const mNames = this.middlewares.map(m => m.name)
        const applyMsg = this.applyMsg
          ? this.applyMsg
          : `The middlewares applied from the '${this.name}': `
        console.log(applyMsg, mNames)
      }
      this.middlewares.forEach(m => m.apply(app, individualReporting))
    } else this.middlewares.apply(app)
  }
}

module.exports = Middlewares

// -----------------------------------------------------------------------
// supporting functions
// -----------------------------------------------------------------------

function middlewaresArgsErr(middlewaresName, middlewares, applyMsg) {
  const status = new Status()
  nameErr(middlewaresName, 'middlewares group', middlewares, status)
  middlewaresErrCheck(middlewares, middlewaresName, status)
  if (applyMsg && typeof applyMsg !== 'string') {
    status.reportErr(
      `Format of 'applyMsg' in '${middlewaresName}' should be string and not: `,
      applyMsg
    )
  }

  return status.error
}

function middlewaresErrCheck(middlewares, middlewaresName, status) {
  if (Array.isArray(middlewares))
    middlewares.forEach(m => middlewareErrCheck(m, middlewaresName, status))
  else middlewareErrCheck(middlewares, middlewaresName, status)
}

function middlewareErrCheck(middlewareObj, middlewaresName, status) {
  if (middlewareObj.constructor !== Middleware) {
    const extraInfo =
      middlewaresName && typeof middlewaresName === 'string'
        ? ''
        : ` in the middleware group: ${middlewaresName}.`
    status.reportErr(
      'Wrong format of the middleware: ',
      middlewareObj,
      extraInfo
    )
  }
}
