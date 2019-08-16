const { middlewareMock } = require('../../../../modules/helpers/middleware')

const middlewareTestData = [
  {
    title:
      'returns instance with middlewareFn null and reports error in case of empty definition',
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
        name: 'myMiddlewareName1',
        type: 'use',
        routePaths: '/route/path',
        middleware: () => ''
      },
      {
        name: 'myMiddlewareName2',
        middleware: () => ''
      },
      {
        name: 'myMiddlewareName3',
        type: 'get',
        routePaths: ['/route/path', '/', /abc*/],
        middleware: __dirname + '/middleware-test-function.js'
      },
      {
        name: 'myMiddlewareName4',
        routePaths: /abc*/,
        middleware: './middleware-test-function.js',
        options: {
          rootDir: __dirname,
          defaultType: 'put'
        }
      }
    ],
    result: [
      {
        name: 'myMiddlewareName1',
        type: 'use',
        routePaths: '/route/path',
        middlewareFn: () => ''
      },
      {
        name: 'myMiddlewareName2',
        type: 'use',
        routePaths: undefined,
        middlewareFn: () => ''
      },
      {
        name: 'myMiddlewareName3',
        type: 'get',
        routePaths: ['/route/path', '/', /abc*/],
        middlewareFn: () => 'test'
      },
      {
        name: 'myMiddlewareName4',
        type: 'put',
        routePaths: /abc*/,
        middlewareFn: () => 'test'
      }
    ]
  },
  {
    title:
      'returns instance with middlewareFn null and reports error(s) in case of incorrect definition',
    definition: [
      {
        name: 'myMiddlewareName1',
        type: 'user',
        routePaths: '/route/path',
        middleware: () => ''
      }
      //     {
      //       name: 'myMiddlewareName',
      //       middleware: () => ''
      //     },
      //     {
      //       name: 'myMiddlewareName',
      //       type: 'get',
      //       routePaths: ['/route/path', '/', /abc*/],
      //       middleware: __dirname + '/middleware-test-function.js'
      //     }
    ],
    result: [
      {
        name: 'myMiddlewareName1',
        middlewareFn: null
      }
      //     {
      //       name: 'myMiddlewareName',
      //       type: 'use',
      //       routePaths: undefined,
      //       middlewareFn: () => ''
      //     },
      //     {
      //       name: 'myMiddlewareName',
      //       type: 'get',
      //       routePaths: ['/route/path', '/', /abc*/],
      //       middlewareFn: () => 'test'
      //     }
    ],
    errMsg: {
      args: [
        'Error: ',
        'Invalid middleware type: ',
        'user',
        'provided for the middleware: myMiddlewareName1.'
      ]
    }
  }
]

module.exports = middlewareTestData
