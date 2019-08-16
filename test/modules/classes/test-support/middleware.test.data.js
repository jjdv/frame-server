const { middlewareMock } = require('../../../../modules/helpers/middleware')

const mCErr1 = {
  name: '',
  type: 'get',
  routePaths: ['/route/path', {}, /abc*/],
  middleware: '/test',
  options: {
    rootDir: 'C:\\testDir'
  }
}

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
      },
      mCErr1
    ],
    result: [
      {
        name: 'myMiddlewareName1',
        middlewareFn: null
      },
      {
        name: '',
        middlewareFn: null
      }
    ],
    errMsg: [
      {
        args: [
          'Error: ',
          'Invalid middleware type: ',
          'user',
          'provided for the middleware: myMiddlewareName1.'
        ]
      },
      [
        {
          args: [
            'Error: ',
            'Cannot find "C:\\test" specified by the \'\' as "/test"'
          ]
        },
        {
          args: [
            'Error: ',
            "Missing name of the 'middleware' with definition:",
            mCErr1
          ]
        },
        {
          args: [
            'Error: ',
            "No middleware function provided for the middleware: ''."
          ]
        },
        {
          args: ['Error: ', "Wrong path format in ''."]
        }
      ]
    ]
  }
]

module.exports = middlewareTestData
