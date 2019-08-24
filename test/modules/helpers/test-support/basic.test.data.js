const path = require('path')

/**
 * test data for filePath and filePathRequired
 */

const falsyVars = [false, null, undefined, '', 0]
const emptyVars = [{}, [], '']
const falsyEmptyVars = [...falsyVars, {}, []]
const nonEmptyVars = [{ a: 'a' }, ['a'], 'a']
const stringValues = ['abc', '...', '///\\"']
const nonObjectValues = [[], /a/, 55]
const nonStringValues = [{}, ...nonObjectValues]
const validDirPath = __dirname
const validFilePath = __filename
const validFileNameStr = path.basename(__filename)
const invalidDirPath = path.join(__dirname, 'aaa')
const invalidFilePath = path.join(__filename, 'aaa')

/**
 * test data for routePathsErr
 */

const testPathsData = {
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
        "The specification of the path in 'testVarName' cannot be empty."
      ]
    },
    {
      paths: ['/', '', 'some/path', '/good', undefined],
      varName: 'testVarName',
      result: true,
      errMsg: [
        "The specification of the path in 'testVarName' cannot be empty.",
        "Route paths in 'testVarName' should be absolute, i.e. start with: '/' but is defined as: 'some/path'.",
        "Wrong path format in 'testVarName'."
      ]
    }
  ]
}

module.exports = {
  falsyVars,
  emptyVars,
  falsyEmptyVars,
  nonEmptyVars,
  stringValues,
  nonObjectValues,
  nonStringValues,
  validDirPath,
  validFilePath,
  validFileNameStr,
  invalidDirPath,
  invalidFilePath,
  testPathsData
}
