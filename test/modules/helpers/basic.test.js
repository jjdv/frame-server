/* eslint-env mocha */
'use strict'

const path = require('path')

// test environment
const { expect, sinon } = require('../../test-env')

// methods under test
const {
  isEmpty,
  isDirectory,
  isFile
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
let consoleErrorStub, res

describe('modules > helpers > basic.js', () => {
  before(() => {
    consoleErrorStub = sinon.stub(console, 'error')
  })

  beforeEach(async () => {
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

  describe('appRootDir', function () {
    const rootDir = path.resolve(__dirname, '../../../..')
    const helpersBasicAbsPath = require.resolve(
      '../../../modules/helpers/basic'
    )
    let replace

    before(() => {
      // flag test scope being executed
      global.testReplace = { 'basic.js': {} }
      replace = global.testReplace['basic.js']
    })

    beforeEach(() => {
      delete require.cache[helpersBasicAbsPath]
    })

    after(() => {
      delete global.testReplace
    })

    it("provides correct 'rootDir' if package is located directly in the server root directory", function () {
      // set __dirname to test value
      replace.__dirname = path.resolve(rootDir, 'frame-server/modules/config')
      const { appRootDir } = require('../../../modules/helpers/basic')
      expect(appRootDir).to.equal(rootDir)
    })

    it("provides correct 'rootDir' if package is located in 'node_modules' in the server root directory", function () {
      // set __dirname to test value
      replace.__dirname = path.resolve(
        rootDir,
        'node_modules/frame-server/modules/config'
      )
      const { appRootDir } = require('../../../modules/helpers/basic')
      expect(appRootDir).to.equal(rootDir)
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
