const { checkName } = require('./helpers-basic')
const { createGetOnlyProps } = require('./helpers-object')
const Middleware = require('./class-middleware')
const Status = require('./class-status')

function Middlewares (middlewaresName, middlewares, applyMsg) {
  if (!Array.isArray(middlewares)) middlewares = [ middlewares ]
  if (middlewaresArgsErr(middlewaresName, middlewares, applyMsg)) return

  createGetOnlyProps(this, { name: middlewaresName, middlewares, applyMsg })
}

Middlewares.validate = function (msDef, validateFn, status) {
  if (!msDef) return

  if (!Array.isArray(msDef)) msDef = [ msDef ]
  let mDef
  for (let index = 0; index < msDef.length; index++) {
    mDef = msDef[index]
    validateFn(mDef, index, status)
  }
}

Middlewares.fromDef = function (middlewaresName, middlewaresDef, options, applyMsg) {
  if (middlewaresNameErrCheck(middlewaresName, middlewaresDef, applyMsg)) return null

  if (!Array.isArray(middlewaresDef)) middlewaresDef = [ middlewaresDef ]
  const middlewares = []
  let mDef, middleware
  for (let index = 0; index < middlewaresDef.length; index++) {
    mDef = middlewaresDef[index]
    if (mDef.constructor !== Object) {
      mDef = {
        name: `${middlewaresName}-${index}`,
        middleware: mDef
      }
    } else if (!mDef.name) mDef.name = `${middlewaresName}-${index}`
    middleware = Middleware.fromDef(mDef, options)
    if (!middleware) return null
    middlewares.push(middleware)
  }

  return new Middlewares(middlewaresName, middlewares, applyMsg)
}

Middlewares.propotype.apply = function (app, groupReporting = true) {
  if (!app || !this.middlewares) return

  const individualReporting = !groupReporting
  if (Array.isArray(this.middlewares)) {
    if (groupReporting) {
      const mNames = this.middlewares.map(m => m.name)
      const applyMsg = this.applyMsg ? this.applyMsg : `The middlewares applied from the '${this.name}': `
      console.log(applyMsg, mNames)
    }
    this.middlewares.forEach(m => m.apply(app, individualReporting))
  } else this.middlewares.apply(app)
}

module.exports = Middlewares

// -------------------------------------------------------------------------------
// supporting functions
// -------------------------------------------------------------------------------

function middlewaresArgsErr (middlewaresName, middlewares, applyMsg) {
  const status = new Status()
  middlewaresNameErrCheck(middlewaresName, middlewares, status)
  middlewaresErrCheck(middlewares, middlewaresName, status)
  if (applyMsg && typeof applyMsg !== 'string') { status.reportErr(`Error: Format of 'applyMsg' in '${middlewaresName}' should be string and not: `, applyMsg) }

  return status.error
}

function middlewaresNameErrCheck (middlewaresName, middlewares, status) {
  return checkName(middlewaresName, 'middlewares group', middlewares, status)
}

function middlewaresErrCheck (middlewares, middlewaresName, status) {
  if (Array.isArray(middlewares)) middlewares.forEach(m => middlewareErrCheck(m, middlewaresName, status))
  else middlewareErrCheck(middlewares, middlewaresName, status)
}

function middlewareErrCheck (middlewareObj, middlewaresName, status) {
  if (middlewareObj.constructor !== Middleware) {
    const extraInfo = middlewaresName && typeof middlewaresName === 'string' ? '' : ` in the middleware group: ${middlewaresName}.`
    status.reportErr('Wrong format of the middleware: ', middlewareObj, extraInfo)
  }
}
