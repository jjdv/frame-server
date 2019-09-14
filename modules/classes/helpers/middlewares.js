const Status = require('../status')
const Middleware = require('../middleware')
const { nameErr } = require('../../helpers/basic')

function validateDefs (defs, validateFn, status) {
  if (!defs) return

  if (!Array.isArray(defs)) defs = [defs]
  defs.forEach((def, index) => validateFn(def, index, status))
}

function middlewaresArgsErr (middlewaresName, middlewares, applyMsg, status) {
  if (!status) status = new Status()

  nameErr(middlewaresName, 'middlewares group', middlewares, status)
  middlewaresErrCheck(middlewares, middlewaresName, status)
  applyMsgErrCheck(applyMsg, middlewaresName, status)

  return status.error
}

module.exports = { validateDefs, middlewaresArgsErr }

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

function middlewaresErrCheck (middlewares, middlewaresName, status) {
  if (Array.isArray(middlewares)) {
    middlewares.forEach(m => middlewareErrCheck(m, middlewaresName, status))
  } else middlewareErrCheck(middlewares, middlewaresName, status)
}

function middlewareErrCheck (middlewareObj, middlewaresName, status) {
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

function applyMsgErrCheck (applyMsg, middlewaresName, status) {
  if (applyMsg && typeof applyMsg !== 'string') {
    status.reportErr(
      `Format of 'applyMsg' in '${middlewaresName}' should be string and not: `,
      applyMsg
    )
  }
}
