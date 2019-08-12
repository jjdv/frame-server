const { middlewareMock } = require('../../../../modules/helpers/middleware')

const middlewareTestData = [
  {
    title: 'returns empty class in case of empty definition',
    definition: [null, false, undefined, {}, [], ''],
    result: middlewareMock,
    errMsg: {
      args: ['Error: ', 'A siteMiddleware definition cannot be empty.']
    }
  },
  {
    title: 'returns correct middleware instance if definition is correct',
    definition: {
      name: 'myMiddlewareName',
      type: 'use',
      routePaths: '/route/path',
      middleware: () => ''
    },
    result: {
      name: 'myMiddlewareName',
      type: 'use',
      routePaths: '/route/path',
      middlewareFn: () => ''
    }
  }
]

module.exports = middlewareTestData
