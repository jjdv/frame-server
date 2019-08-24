/* eslint-env mocha */
'use strict'

// test environment
const { expect, sinon } = require('../../test-env')

const Status = require('../../../modules/classes/status')

// methods under test
const {
  isDirectory,
  isFile,
  isEmpty
} = require('../../../modules/helpers/basic')

// test data
const {
  invalidPaths,
  validDirPath,
  validFilePath,
  falsyVars,
  emptyVars,
  nonEmptyVars
} = require('./test-support/basic.test.data')

// test variables
let status, consoleErrorStub, res

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

  describe('isEmpty()', () => {
    it('returns true for falsy variables', () => {
      falsyVars.forEach(val => {
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

  describe('isDirectory()', () => {
    returnsFalseForInvalidPaths()

    it('returns false for valid file path', () => {
      res = isDirectory(validFilePath)
      expect(res).to.be.false()
    })

    it('returns true for valid directory path', () => {
      res = isDirectory(validDirPath)
      expect(res).to.be.true()
    })
  })

  describe('isFile()', () => {
    returnsFalseForInvalidPaths()

    it('returns false for valid directory path', () => {
      res = isFile(validDirPath)
      expect(res).to.be.false()
    })

    it('returns true for valid file path', () => {
      res = isFile(validFilePath)
      expect(res).to.be.true()
    })
  })
})

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

function returnsFalseForInvalidPaths () {
  it('returns false for invalid directory paths', () => {
    invalidPaths.forEach(invD => {
      res = isDirectory(invD)
      expect(res).to.be.false()
    })
  })
}
