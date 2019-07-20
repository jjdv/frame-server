const path = require('path')

/**
 * test data for filePath and filePathNotEmpty
 */

exports.falsy = [false, null, undefined, '']
exports.stringValues = ['abc', '...', '///\\"']
exports.nonStringFilePaths = [{}, [], /a/]
exports.validDirName = __dirname
exports.invalidDirName = path.join(__dirname, 'aaa')
exports.validFileName = path.basename(__filename)
exports.invalidFileName = path.join(__filename, 'aaa')
exports.emptyVars = [{}, [], '']
exports.nonEmptyVars = [{ a: 'a' }, ['a'], 'a']

/**
 * test data for routePathsErr
 */

exports.testPathsData = {
  valid: [
    {
      paths: '/',
      result: false
    },
    {
      paths: /abc/,
      result: false
    },
    {
      paths: ['/', '/some/path', /aaa/],
      result: false
    }
  ],
  invalid: [
    {
      paths: '',
      varName: 'testVarName',
      result: true,
      errMsg: [
        "Error: The specification of the path in 'testVarName' cannot be an empty string."
      ]
    },
    {
      paths: ['/', '', 'some/path', '/good', undefined],
      varName: 'testVarName',
      result: true,
      errMsg: [
        "Error: The specification of the path in 'testVarName' cannot be an empty string.",
        "Error: Route paths in 'testVarName' should be absolute, i.e. start with: '/' but is defined as: 'some/path'.",
        "Wrong path format in 'testVarName'."
      ]
    }
  ]
}
