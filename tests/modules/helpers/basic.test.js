/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(dirtyChai)
chai.use(sinonChai)

const path = require('path')

const { filePath } = require('../../../modules/helpers/basic')
const validDirName = __dirname
const invalidDirName = path.join(validDirName, 'aaa')
const validFileName = path.basename(__filename)
const invalidFileName = path.join(validFileName, 'aaa')
const { falsy } = require('../../test-helpers/data')
let res

describe('in helpers basic, ', function () {
  describe('filePath', function () {
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
