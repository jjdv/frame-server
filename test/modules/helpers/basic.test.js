/* eslint-env mocha */
'use strict'

// test environment
const path = require('path')
const { expect, sinon } = require('../../test-env')

const Status = require('../../../modules/classes/status')

// methods under test
const {
  filePath,
  filePathNotEmpty,
  routePathsErr,
  nameErr,
  isEmpty
} = require('../../../modules/helpers/basic')

// test data
const {
  falsy,
  stringValues,
  nonStringFilePaths,
  validDirName,
  invalidDirName,
  validFileName,
  invalidFileName,
  emptyVars,
  nonEmptyVars,
  testPathsData
} = require('./test-support/basic.test.data')

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

  describe('filePath()', () => {
    it('returns null for falsy paths but does not report an error', () => {
      falsy.forEach(falsyVal => {
        res = filePath(falsyVal, __dirname, 'testName', status)
        expect(res).to.be.null()
        consoleErrorStub.should.have.not.been.called()
      })
    })

    filePathBaseTests(filePath)
  })

  describe('filePathNotEmpty()', () => {
    it('returns null and reports error for empty/falsy path', () => {
      falsy.forEach(falsyVal => {
        res = filePathNotEmpty(falsyVal, __dirname, 'testName', status)
        expect(res).to.be.null()
      })
      consoleErrorStub.should.have.callCount(falsy.length)
      consoleErrorStub.should.always.have.been.calledWithExactly(
        'Error: ',
        "The specification of the file path in the 'testName' cannot be an empty string."
      )
    })

    filePathBaseTests(filePathNotEmpty)
  })

  describe('routePathsErr()', () => {
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
  })

  describe('nameErr()', () => {
    before(() => {
      varName = 'testVarName'
      varDef = { varDef: 'varDef' }
    })

    it('returns true and reports relevant error for empty/falsy values', () => {
      falsy.forEach(val => {
        res = nameErr(val, varName, varDef, status)
        expect(res).to.be.true()
      })
      consoleErrorStub.should.have.callCount(falsy.length)
      consoleErrorStub.should.always.have.been.calledWithExactly(
        'Error: ',
        `Missing name of the '${varName}' with definition:`,
        varDef
      )
    })

    it('returns true and reports relevant error for non-string values', () => {
      nonStringFilePaths.forEach(val => {
        res = nameErr(val, varName, varDef, status)
        expect(res).to.be.true()
      })
      consoleErrorStub.should.have.callCount(nonStringFilePaths.length)
      nonStringFilePaths.forEach((val, indx) => {
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
  })

  describe('isEmpty()', () => {
    it('returns true for falsy variables', () => {
      falsy.forEach(val => {
        res = isEmpty(val)
        expect(res).to.be.true()
      })
    })

    it('returns true for empty variables', () => {
      emptyVars.forEach(val => {
        res = isEmpty(val)
        expect(res).to.be.true()
      })
    })

    it('returns false for non-empty variables', () => {
      nonEmptyVars.forEach(val => {
        res = isEmpty(val)
        expect(res).to.be.false()
      })
    })
  })
})

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

function filePathBaseTests(filePathTestFn) {
  let resolvedFilePath

  it('returns null and reports error for non-string path', () => {
    nonStringFilePaths.forEach(nonStrVal => {
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
    res = filePathTestFn(invalidFileName, validDirName, 'testName', status)
    expect(res).to.be.null()
    resolvedFilePath = path.resolve(validDirName, invalidFileName)
    consoleErrorStub.should.have.been.calledOnceWithExactly(
      'Error: ',
      `Cannot find "${resolvedFilePath}" specified by the 'testName' as "${invalidFileName}"`
    )

    consoleErrorStub.resetHistory()
    res = filePathTestFn(validFileName, invalidDirName, 'testName', status)
    expect(res).to.be.null()
    resolvedFilePath = path.resolve(invalidDirName, validFileName)
    consoleErrorStub.should.have.been.calledOnceWithExactly(
      'Error: ',
      `Cannot find "${resolvedFilePath}" specified by the 'testName' as "${validFileName}"`
    )
  })

  it('returns filePath for valid paths', () => {
    res = filePathTestFn(validFileName, validDirName, 'testName', status)
    resolvedFilePath = path.resolve(validDirName, validFileName)
    expect(res).to.be.equal(resolvedFilePath)
    consoleErrorStub.should.have.not.been.called()
  })
}
