/* eslint-env mocha */
'use strict'

// test environment
const path = require('path')
const { expect, sinon } = require('../../test-env')

const Status = require('../../../modules/classes/status')

// methods under test
const {
  validatedDirectory,
  validateView,
  filePath,
  filePathRequired,
  routePathsErr,
  nameErr
} = require('../../../modules/helpers/validators')

// test data
const {
  falsyVars,
  stringValues,
  nonObjectValues,
  nonStringValues,
  testPathsData,
  validDirPath,
  validFilePath,
  validFileNameStr,
  invalidDirPath,
  invalidFilePath
} = require('./test-support/basic.test.data')
const validViews = require('./test-support/validators.test.data')

// test variables
let status, consoleErrorStub, res, varName, varDef

describe('modules > helpers > basic.js', () => {
  before(() => {
    status = new Status()
    consoleErrorStub = sinon.stub(console, 'error')
  })

  beforeEach(async () => {
    status.reset()
    consoleErrorStub.resetHistory()
  })

  after(() => {
    consoleErrorStub.restore()
  })

  describe('validatedDirectory()', () => {
    testValidatedDirectory()
  })

  describe('validateView()', () => {
    testValidateView()
  })

  describe('filePath()', () => {
    testFilePath()
  })

  describe('filePathRequired()', () => {
    testFilePathRequired()
  })

  describe('routePathsErr()', () => {
    testRoutePathsErr()
  })

  describe('nameErr()', () => {
    testNameErr()
  })
})

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

function testValidatedDirectory () {
  it('reports error and returns null for falsy values', () => {
    falsyVars.forEach(falsyVal => {
      consoleErrorStub.resetHistory()
      res = validatedDirectory('testDirName', falsyVal, __dirname, status)
      expect(res).to.be.null()
      consoleErrorStub.should.have.been.calledOnceWithExactly(
        'Error: ',
        "Missing directory 'testDirName'."
      )
    })
  })

  it('reports error and returns null if directory spec is not a string', () => {
    nonStringValues.forEach(nonStringVal => {
      consoleErrorStub.resetHistory()
      res = validatedDirectory('testDirName', nonStringVal, __dirname, status)
      expect(res).to.be.null()
      consoleErrorStub.should.have.been.calledOnceWithExactly(
        'Error: ',
        "Wrong directory format of 'testDirName':",
        nonStringVal
      )
    })
  })

  it('reports error and returns null if directory does not exist', () => {
    res = validatedDirectory('testDirName', 'abc', __dirname, status)
    expect(res).to.be.null()
    consoleErrorStub.should.have.been.calledOnceWithExactly(
      'Error: ',
      `Cannot find directory "${__dirname}\\abc" specified in 'testDirName'.`
    )
  })

  it('returns absolute directory path for valid directory spec', () => {
    res = validatedDirectory('testDirName', __dirname, null, status)
    expect(res).to.equal(__dirname)
    consoleErrorStub.should.have.not.been.called()
  })
}

function testValidateView () {
  it('reports error and returns status.error true for non-object values', () => {
    nonObjectValues.forEach(nonObjectVal => {
      consoleErrorStub.resetHistory()
      validateView(nonObjectVal, status)
      expect(status.error).to.be.true()
      consoleErrorStub.should.have.been.calledOnceWithExactly(
        'Error: ',
        'Wrong format of the view definition in the server config file:',
        nonObjectVal
      )
    })
  })

  it('reports error and returns status.error true for non-string, not falsy view.engine values', () => {
    nonStringValues.forEach(nonObjectVal => {
      consoleErrorStub.resetHistory()
      validateView({ engine: nonObjectVal }, status)
      expect(status.error).to.be.true()
      consoleErrorStub.should.have.been.calledOnceWithExactly(
        'Error: ',
        'view.engine in the server config file must be a string, not: ',
        nonObjectVal
      )
    })
  })

  it('reports error and returns status.error true for invalid, not falsy view.dir values', () => {
    ;[{}, /abc/, 44].forEach(wrongFormatVal => {
      consoleErrorStub.resetHistory()
      validateView({ dir: wrongFormatVal }, status)
      expect(status.error).to.be.true()
      consoleErrorStub.should.have.been.calledOnceWithExactly(
        'Error: ',
        'view.dir in the server config file must be a string or an array of strings, not: ',
        wrongFormatVal
      )
    })

    process.env.ROOT_DIR = 'c:/root'
    const testDirArrs = [
      'abc',
      ['...', invalidDirPath],
      [invalidFilePath, validFilePath]
    ]
    testDirArrs.forEach(wrongFormatVal => {
      consoleErrorStub.resetHistory()
      validateView({ dir: wrongFormatVal }, status)
      expect(status.error).to.be.true()
      if (!Array.isArray(wrongFormatVal)) wrongFormatVal = [wrongFormatVal]
      wrongFormatVal.forEach((wfVal, index) => {
        const dir = path.resolve('c:/root', wfVal)
        consoleErrorStub
          .getCall(index)
          .should.have.been.calledWithExactly(
            'Error: ',
            `Cannot find directory "${dir}" specified in 'view.dir'.`
          )
      })
    })
  })

  it('returns status.error false for valid view definitions', () => {
    validViews.forEach(validView => validateView(validView, status))
    expect(status.error).to.be.false()
    consoleErrorStub.should.have.not.been.called()
  })
}

function testFilePath () {
  it('returns null for falsy paths but does not report an error', () => {
    falsyVars.forEach(falsyVal => {
      res = filePath(falsyVal, __dirname, 'testName', status)
      expect(res).to.be.null()
      consoleErrorStub.should.have.not.been.called()
    })
  })

  filePathBaseTests(filePath)
}

function testFilePathRequired () {
  it('returns null and reports error for empty/falsy path', () => {
    falsyVars.forEach(falsyVal => {
      res = filePathRequired(falsyVal, __dirname, 'testName', status)
      expect(res).to.be.null()
    })
    consoleErrorStub.should.have.callCount(falsyVars.length)
    consoleErrorStub.should.always.have.been.calledWithExactly(
      'Error: ',
      "The specification of the file path in the 'testName' cannot be empty."
    )
  })

  filePathBaseTests(filePathRequired)
}

function testRoutePathsErr () {
  it('returns false for valid paths', () => {
    testPathsData.valid.forEach(td => {
      const res = routePathsErr(td.paths, td.varName, status)
      expect(res).to.be.false()
      consoleErrorStub.should.have.not.been.called()
    })
  })

  it('returns true and reports relevant error for invalid paths', () => {
    testPathsData.invalid.forEach(td => {
      consoleErrorStub.resetHistory()
      const res = routePathsErr(td.paths, td.varName, status)
      expect(res).to.be.true()
      consoleErrorStub.should.have.callCount(td.errMsg.length)
      td.errMsg.forEach((errMsg, indx) => {
        consoleErrorStub
          .getCall(indx)
          .should.have.been.calledWithExactly('Error: ', errMsg)
      })
    })
  })
}

function testNameErr () {
  before(() => {
    varName = 'testVarName'
    varDef = { varDef: 'varDef' }
  })

  it('returns true and reports relevant error for empty/falsy values', () => {
    falsyVars.forEach(val => {
      res = nameErr(val, varName, varDef, status)
      expect(res).to.be.true()
    })
    consoleErrorStub.should.have.callCount(falsyVars.length)
    consoleErrorStub.should.always.have.been.calledWithExactly(
      'Error: ',
      `Missing name of the '${varName}' with definition:`,
      varDef
    )
  })

  it('returns true and reports relevant error for non-string values', () => {
    nonStringValues.forEach(val => {
      res = nameErr(val, varName, varDef, status)
      expect(res).to.be.true()
    })
    consoleErrorStub.should.have.callCount(nonStringValues.length)
    nonStringValues.forEach((val, indx) => {
      consoleErrorStub
        .getCall(indx)
        .should.have.been.calledWithExactly(
          'Error: ',
          `The name of the '${varName}', with definition:`,
          varDef,
          ' must be a string and not: ',
          val
        )
    })
  })

  it('returns false for non-empty string values', () => {
    stringValues.forEach(val => {
      res = nameErr(val, 'testVarName', 'varValue', status)
      expect(res).to.be.false()
    })
    consoleErrorStub.should.have.not.been.called()
  })
}

function filePathBaseTests (filePathTestFn) {
  let resolvedFilePath

  it('returns null and reports error for non-string path', () => {
    nonStringValues.forEach(nonStrVal => {
      consoleErrorStub.resetHistory()
      res = filePathTestFn(nonStrVal, null, 'testName', status)
      expect(res).to.be.null()
      consoleErrorStub.should.have.been.calledOnceWithExactly(
        'Error: ',
        "Wrong file path format of 'testName':",
        nonStrVal
      )
    })
  })

  it('returns null and reports error for invalid paths', () => {
    res = filePathTestFn(invalidFilePath, validDirPath, 'testName', status)
    expect(res).to.be.null()
    resolvedFilePath = path.resolve(validDirPath, invalidFilePath)
    consoleErrorStub.should.have.been.calledOnceWithExactly(
      'Error: ',
      `Cannot find file "${resolvedFilePath}" specified by the 'testName' as "${invalidFilePath}"`
    )

    consoleErrorStub.resetHistory()
    res = filePathTestFn(validFileNameStr, invalidDirPath, 'testName', status)
    expect(res).to.be.null()
    resolvedFilePath = path.resolve(invalidDirPath, validFileNameStr)
    consoleErrorStub.should.have.been.calledOnceWithExactly(
      'Error: ',
      `Cannot find file "${resolvedFilePath}" specified by the 'testName' as "${validFileNameStr}"`
    )
  })

  it('returns filePath for valid paths', () => {
    res = filePathTestFn(validFileNameStr, validDirPath, 'testName', status)
    resolvedFilePath = path.resolve(validDirPath, validFileNameStr)
    expect(res).to.equal(resolvedFilePath)
    consoleErrorStub.should.have.not.been.called()
  })
}
