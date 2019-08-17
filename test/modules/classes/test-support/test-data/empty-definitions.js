const { middlewareMock } = require('../../../../../modules/helpers/middleware')

const emptyDefinitions = {
  title:
    'returns instance with middlewareFn null and reports error in case of empty definition',
  definition: [null, false, undefined, {}, [], ''],
  result: middlewareMock,
  errMsg: {
    args: ['Error: ', 'A siteMiddleware definition cannot be empty.']
  }
}

module.exports = emptyDefinitions
