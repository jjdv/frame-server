
const Middleware = require('../modules/class-middleware')

function validateWrongRequestHandlerDef (wrongRequestHandlerDef, status) {
  Middleware.validateDef(getWrongRequestHandlerDef(wrongRequestHandlerDef), {}, status)
}

function wrongRequestHandler (wrongRequestHandlerDef) {
  return Middleware.fromDef(getWrongRequestHandlerDef(wrongRequestHandlerDef))
}

module.exports = { validateWrongRequestHandlerDef, wrongRequestHandler }

// -------------------------------------------------------------------------------
// supporting functions
// -------------------------------------------------------------------------------

function getWrongRequestHandlerDef (wrongRequestHandlerDef) {
  return {
    name: 'wrongRequestHandler',
    middleware: wrongRequestHandlerDef || ((req, res) => res.sendStatus(404))
  }
}
