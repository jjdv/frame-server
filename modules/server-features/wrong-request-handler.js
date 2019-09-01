const Middleware = require('../classes/middleware')
const { middlewareArgsErr } = require('../helpers/middleware')

function validateWrongRequestHandlerDef (wrongRequestHandlerDef, status) {
  const mArgs = Middleware.defToArgs(
    getWrongRequestHandlerDef(wrongRequestHandlerDef)
  )
  middlewareArgsErr(...mArgs, status)
}

function wrongRequestHandler (wrongRequestHandlerDef) {
  return Middleware.fromDef({
    name: 'wrongRequestHandler',
    middleware: wrongRequestHandlerDef || ((req, res) => res.sendStatus(404))
  })
}

module.exports = { validateWrongRequestHandlerDef, wrongRequestHandler }

//
// -------------------------------------------------------------------------------
// supporting functions
// -------------------------------------------------------------------------------

function getWrongRequestHandlerDef (wrongRequestHandlerDef) {
  return {
    name: 'wrongRequestHandler',
    middleware: wrongRequestHandlerDef || ((req, res) => res.sendStatus(404))
  }
}
