/* eslint-env mocha */
'use strict'

// test environment
const { expect, sinon } = require('../../test-env')

// method under tets
const { filePath } = require('../../../modules/helpers/basic')

// test data
const { falsy, validDirName, invalidDirName, validFileName, invalidFileName } = require('./basic.data')
let res

// test body
describe('in basic helpers (modules > helpers > basic.js), ', function () {
  describe('#filePath()', function () {
    describe('should return null for', function () {
      it('falsy paths', () => {
        falsy.forEach(falsyVal => {
          res = filePath(falsyVal)
          expect(res).to.be.null()
        })
      })
      it('invalid paths', function () {
        const status = { reportErr: sinon.spy() }
        res = filePath(invalidFileName, validDirName, 'testName', status)
        expect(res).to.be.null()
        res = filePath(validFileName, invalidDirName, 'testName', status)
        expect(res).to.be.null()
      })
    })
  })
})
