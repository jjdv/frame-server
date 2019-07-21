/* eslint-env mocha */
'use strict'

// test environment
const path = require('path')
const { expect, sinon } = require('../../test-env')

// class under test
const Status = require('../../../modules/classes/status')

// test variables
const errMsg = 'error message'
const errMsgs = Array(3)
  .fill(1)
  .map((el, indx) => errMsg + indx)
const invalidStatusArgs = [{}, [], 'invalid', 33]
const invalidStatusPropNames = [3, null, undefined, /a/, {}, []]
const statusProps = ['one', '2', ...invalidStatusPropNames]
let status, consoleErrorStub

// --------------------------------------------------------
// ------------ test body -------------------------------
// --------------------------------------------------------

describe('Middleware', function() {
  // >>>>>>>> setup <<<<<<<<<
  before(() => {
    consoleErrorStub = sinon.stub(console, 'error')
  })

  beforeEach(async () => {
    consoleErrorStub.resetHistory()
  })

  after(() => {
    consoleErrorStub.restore()
  })
  // >>>>>> end of setup <<<<<<

  describe('.validateDef()', function() {
    it('has the initial error property set to false', () => {
      status = new Status()
      expect(status.error).to.be.false()
    })
  })
})
