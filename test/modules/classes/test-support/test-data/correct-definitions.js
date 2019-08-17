const correctDefinitions = {
  title: 'returns correct middleware instance if definition is correct',
  definition: [
    {
      name: 'myMiddlewareName1',
      type: 'use',
      routePaths: '/route/path',
      middleware: () => '',
      result: {
        name: 'myMiddlewareName1',
        type: 'use',
        routePaths: '/route/path',
        middlewareFn: () => ''
      }
    },
    {
      name: 'myMiddlewareName2',
      middleware: () => '',
      result: {
        name: 'myMiddlewareName2',
        type: 'use',
        routePaths: undefined,
        middlewareFn: () => ''
      }
    },
    {
      name: 'myMiddlewareName3',
      type: 'get',
      routePaths: ['/route/path', '/', /abc*/],
      middleware: __dirname + '/middleware-test-function.js',
      result: {
        name: 'myMiddlewareName3',
        type: 'get',
        routePaths: ['/route/path', '/', /abc*/],
        middlewareFn: () => 'test'
      }
    },
    {
      name: 'myMiddlewareName4',
      routePaths: /abc*/,
      middleware: './middleware-test-function.js',
      options: {
        rootDir: __dirname,
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
