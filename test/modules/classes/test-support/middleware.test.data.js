const { middlewareMock } = require('../../../../modules/helpers/middleware')

const middlewareTestData = [
  {
    title:
      'returns instance with middlewareFn null in case of empty definition',
    definition: [null, false, undefined, {}, [], ''],
    result: middlewareMock,
    errMsg: {
      args: ['Error: ', 'A siteMiddleware definition cannot be empty.']
    }
  },
  {
    title: 'returns correct middleware instance if definition is correct',
    definition: [
      {
        name: 'myMiddlewareName',
        type: 'use',
        routePaths: '/route/path',
        middleware: () => ''
      },
      {
        name: 'myMiddlewareName',
        middleware: () => ''
      },
      {
        name: 'myMiddlewareName',
        type: 'get',
        routePaths: ['/route/path', '/', /abc*/],
        middleware: __dirname + '/middleware-test-function.js'
      }
    ],
    result: [
      {
        name: 'myMiddlewareName',
        type: 'use',
        routePaths: '/route/path',
        middlewareFn: () => ''
      },
      {
        name: 'myMiddlewareName',
        type: 'use',
        routePaths: undefined,
        middlewareFn: () => ''
      },
      {
        name: 'myMiddlewareName',
        type: 'get',
        routePaths: ['/route/path', '/', /abc*/],
        middlewareFn: () => 'test'
      }
    ]
  }
]

module.exports = middlewareTestData
