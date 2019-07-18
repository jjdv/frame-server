/* eslint-env mocha */
'use strict'

// test environment
const path = require('path')
const { expect, sinon } = require('../../test-env')

// method under tets
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
  nonStringFilePaths,
  validDirName,
  invalidDirName,
  validFileName,
  invalidFileName,
  testPathsData
} = require('./test-support/basic.data')

// test variables
const reportErr = sinon.spy()
class StatusStub {
  constructor() {
    this.error = false
    this.reportErr = function(...errMsgs) {
      this.error = true
      reportErr(...errMsgs)
    }
  }
}
const status = new StatusStub()
let res

describe('modules > helpers > basic.js', function() {
  beforeEach(function() {
    status.error = false
    reportErr.resetHistory()
  })

  describe('filePath()', function() {
    it('returns null for falsy paths but does not report an error', function() {
      falsy.forEach(falsyVal => {
        res = filePath(falsyVal)
        expect(res).to.be.null()
        reportErr.should.have.not.been.called()
      })
    })

    filePathBaseTests(filePath)
  })

  describe('filePathNotEmpty()', function() {
    it('returns null and reports error for empty/falsy path', function() {
      falsy.forEach(falsyVal => {
        res = filePathNotEmpty(falsyVal, null, 'testName', status)
        expect(res).to.be.null()
        reportErr.lastCall.should.have.been.calledWith(
          "Error: The specification of the file path in the 'testName' cannot be an empty string."
        )
      })
    })

    filePathBaseTests(filePathNotEmpty)
  })

  describe('routePathsErr()', function() {
    it('returns false for valid paths', function() {
      testPathsData.valid.forEach(td => {
        const res = routePathsErr(td.paths, td.varName, status)
        expect(res).to.be.false()
        reportErr.should.have.not.been.called()
      })
    })

    it('returns true and reports relevant error for invalid paths', function() {
      testPathsData.invalid.forEach(td => {
        reportErr.resetHistory()
        const res = routePathsErr(td.paths, td.varName, status)
        expect(res).to.be.true()
        expect(reportErr.callCount).to.equal(td.errMsg.length)
        td.errMsg.forEach((errMsg, indx) => {
          reportErr.getCall(indx).calledWithExactly(errMsg)
        })
      })
    })
  })
})

// -------------------------------------------------------
// helpers
// -------------------------------------------------------

function filePathBaseTests(filePathTestFn) {
  let resolvedFilePath

  it('returns null and reports error for non-string path', function() {
    nonStringFilePaths.forEach(nonStrVal => {
      res = filePathTestFn(nonStrVal, null, 'testName', status)
      expect(res).to.be.null()
      reportErr.lastCall.should.have.been.calledWith(
        "Error: Wrong file path format of 'testName':",
        nonStrVal
      )
    })
  })

  it('returns null and reports error for invalid paths', function() {
    res = filePathTestFn(invalidFileName, validDirName, 'testName', status)
    expect(res).to.be.null()
    resolvedFilePath = path.resolve(validDirName, invalidFileName)
    reportErr.lastCall.should.have.been.calledWith(
      `Error: Cannot find "${resolvedFilePath}" specified by the 'testName' as "${invalidFileName}"`
    )

    res = filePathTestFn(validFileName, invalidDirName, 'testName', status)
    expect(res).to.be.null()
    resolvedFilePath = path.resolve(invalidDirName, validFileName)
    reportErr.lastCall.should.have.been.calledWith(
      `Error: Cannot find "${resolvedFilePath}" specified by the 'testName' as "${validFileName}"`
    )
  })

  it('returns filePath for valid paths', function() {
    res = filePathTestFn(validFileName, validDirName, 'testName', status)
    resolvedFilePath = path.resolve(validDirName, validFileName)
    expect(res).to.be.equal(resolvedFilePath)
  })
}
