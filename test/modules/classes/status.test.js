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

describe('instance of Status', function() {
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

  describe('with no props', function() {
    it('has the initial error property set to false', () => {
      status = new Status()
      expect(status.error).to.be.false()
    })

    it('has two properties: error and reportErr', () => {
      expect(status).to.have.all.keys('error', 'reportErr')
    })

    it("reporting error sets error property to true and logs error to console.error('Error: ', ...args)", () => {
      status.reportErr(errMsg)
      expect(status.error).to.be.true()
      consoleErrorStub.calledOnceWithExactly('Error: ', errMsg)
    })

    it('reporting error multiple times keeps error property true and logs all errors to console.error', () => {
      status.error = false
      errMsgs.forEach(errMsg => {
        consoleErrorStub.resetHistory()
        status.reportErr(errMsg)
        expect(status.error).to.be.true()
        consoleErrorStub.calledOnceWithExactly('Error: ', errMsg)
      })
    })
  })

  describe('with invalid props', function() {
    it('returns empty object and reports invalid arguments for creating Status instance', () => {
      invalidStatusArgs.forEach(arg => {
        consoleErrorStub.resetHistory()
        status = new Status(arg)
        expect(Object.keys(status).length).to.equal(0)
        consoleErrorStub.calledOnceWithExactly(
          'Error: Invalid arguments for creating Status instance: ',
          arg,
          '\nExpected array ...'
        )
      })
    })
  })

  describe('with props', function() {
    it('has the initial error property set to false', () => {
      status = new Status(statusProps)
      expect(status.error).to.be.false()
    })

    it('has general properties, error and reporErr, and properties from valid names, provided in array to Status constructor', () => {
      expect(status).to.have.all.keys('error', 'reportErr', 'one', '2')
    })

    it('reports all invalid property names provided in array to Status constructor', () => {
      status = new Status(statusProps)
      invalidStatusPropNames.forEach(invalidSProp => {
        consoleErrorStub.calledOnceWithExactly(
          'Error: Invalid property name for creating Status instance: ',
          invalidSProp,
          'Expected non-empty string ... Property skipped.'
        )
      })
    })

    it('reporting error multiple times keeps error property true and logs all errors to console.error', () => {
      status.error = false
      errMsgs.forEach(errMsg => {
        consoleErrorStub.resetHistory()
        status.reportErr(errMsg)
        expect(status.error).to.be.true()
        consoleErrorStub.calledOnceWithExactly('Error: ', errMsg)
      })
    })

    it('reporting error on status[property} sets additionally status[property].error to true', () => {
      status.error = false
      errMsgs.forEach(errMsg => {
        consoleErrorStub.resetHistory()
        status['one'].reportErr(errMsg)
        expect(status.error).to.be.true()
        expect(status['one'].error).to.be.true()
        expect(status['2'].error).to.be.false()
        consoleErrorStub.calledOnceWithExactly('Error: ', errMsg)
      })
    })
  })
})
