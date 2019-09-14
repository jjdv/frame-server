/* eslint-env mocha */
'use strict'

// test environment
const path = require('path')
const { expect, sinon } = require('../../test-support/test-env')

const Status = require('../../../modules/classes/status')

// methods under test
const { validateView } = require('../../../modules/server-features/view')

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
const validViews = require('./test-support/error-reporters.test.data')

// test variables
let status, consoleErrorStub, res, varName, varDef

describe('modules > server-features > validateView()', () => {
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

    process.env.APP_ROOT_DIR = 'c:/root'
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
})
