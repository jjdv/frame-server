const {
  middlewareMock
} = require('../../../../../../modules/classes/helpers/middleware')

const definitions = [null, false, undefined, {}, [], ''].map(def => ({
  definition: def,
  errMsg: {
    args: ['Error: ', 'Invalid middleware definition: ', def]
  }
}))

const emptyDefinitions = {
  title:
    'returns instance with middlewareFn null and reports error in case of empty definition',
  definition: definitions,
  result: middlewareMock
}

module.exports = emptyDefinitions
