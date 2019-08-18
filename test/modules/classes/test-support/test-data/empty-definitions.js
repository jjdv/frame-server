const { middlewareMock } = require('../../../../../modules/helpers/middleware')

const emptyDefinitions = {
  title:
    'returns instance with middlewareFn null and reports error in case of empty definition',
  definition: [
    {
      definition: null,
      errMsg: {
        args: ['Error: ', 'Invalid middleware definition: ', null]
      }
    },
    {
      definition: false,
      errMsg: {
        args: ['Error: ', 'Invalid middleware definition: ', false]
      }
    },
    {
      definition: undefined,
      errMsg: {
        args: ['Error: ', 'Invalid middleware definition: ', undefined]
      }
    },
    {
      definition: {},
      errMsg: {
        args: ['Error: ', 'Invalid middleware definition: ', {}]
      }
    },
    {
      definition: [],
      errMsg: {
        args: ['Error: ', 'Invalid middleware definition: ', []]
      }
    },
    {
      definition: '',
      errMsg: {
        args: ['Error: ', 'Invalid middleware definition: ', '']
      }
    }
  ],
  result: middlewareMock
}

module.exports = emptyDefinitions
