const correctDefinitions = {
  title: 'returns correct middleware instance if definition is correct',
  definition: [
    {
      definition: {
        name: 'myMiddlewareName1',
        type: 'use',
        routePaths: '/route/path',
        middleware: () => ''
      },
      result: {
        name: 'myMiddlewareName1',
        type: 'use',
        routePaths: '/route/path',
        middlewareFn: () => ''
      }
    },
    {
      definition: {
        name: 'myMiddlewareName2',
        middleware: () => ''
      },
      result: {
        name: 'myMiddlewareName2',
        type: 'use',
        routePaths: undefined,
        middlewareFn: () => ''
      }
    },
    {
      definition: {
        name: 'myMiddlewareName3',
        type: 'get',
        routePaths: ['/route/path', '/', /abc*/],
        middleware: 'middleware-test-function.js'
      },
      options: {
        rootDir: __dirname + '/..'
      },
      result: {
        name: 'myMiddlewareName3',
        type: 'get',
        routePaths: ['/route/path', '/', /abc*/],
        middlewareFn: () => 'test'
      }
    },
    {
      definition: {
        name: 'myMiddlewareName4',
        routePaths: /abc*/,
        middleware: 'middleware-test-function.js'
      },
      options: {
        rootDir: __dirname + '/..',
        defaultType: 'put'
      },
      result: {
        name: 'myMiddlewareName4',
        type: 'put',
        routePaths: /abc*/,
        middlewareFn: () => 'test'
      }
    }
  ]
}

module.exports = correctDefinitions
