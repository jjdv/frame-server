const path = require('path')

const pathToTestFunction = require.resolve(
  '../../../../test-support/test-function'
)

const correctDefinitions = {
  title: 'returns correct middlewares instance if definition is correct',
  definition: [
    {
      middlewaresName: 'myMiddlewaresName1',
      middlewaresDef: () => '',
      result: {
        name: 'myMiddlewaresName1',
        middlewaresLength: 1,
        applyMsg: undefined
      }
    },
    {
      middlewaresName: 'myMiddlewaresName2',
      middlewaresDef: [() => '', path.basename(pathToTestFunction)],
      options: {
        rootDir: path.dirname(pathToTestFunction)
      },
      applyMsg: 'Test apply message.',
      result: {
        name: 'myMiddlewaresName2',
        middlewaresLength: 2,
        applyMsg: 'Test apply message.'
      }
    }
  ]
}

module.exports = correctDefinitions
