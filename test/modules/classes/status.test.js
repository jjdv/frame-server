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
    status = new Status()
    consoleErrorStub = sinon.stub(console, 'error')
  })

  beforeEach(() => {
    status.reset()
    consoleErrorStub.resetHistory()
  })

  after(() => {
    consoleErrorStub.restore()
  })
  // >>>>>> end of setup <<<<<<

  describe('with no props', function() {
    it('has the initial error property set to false', () => {
      expect(status.error).to.be.false()
    })

    it('has two properties: error, reportErr and reset method', () => {
      expect(status).to.have.all.keys('error', 'reportErr')
      expect(status.reset).to.exist()
    })

    it("reporting error sets error property to true and logs error to console.error('Error: ', ...args)", () => {
      status.reportErr(errMsg)
      expect(status.error).to.be.true()
      consoleErrorStub.calledOnceWithExactly('Error: ', errMsg)
    })

    it('resetting status sets error property to false', () => {
      status.reportErr(errMsg)
      expect(status.error).to.be.true()
      status.reset()
      expect(status.error).to.be.false()
    })

    it('reporting error multiple times keeps error property true and logs all errors to console.error', () => {
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

    it('has general properties, method and properties from valid prop names, provided in array to Status constructor', () => {
      expect(status).to.have.all.keys('error', 'reportErr', 'one', '2')
      expect(status.reset).to.exist()
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
      errMsgs.forEach(errMsg => {
        consoleErrorStub.resetHistory()
        status.reportErr(errMsg)
        expect(status.error).to.be.true()
        consoleErrorStub.calledOnceWithExactly('Error: ', errMsg)
      })
    })

    it('reporting error on status[property} sets additionally status[property].error to true', () => {
      errMsgs.forEach(errMsg => {
        status.reset()
        consoleErrorStub.resetHistory()
        status['one'].reportErr(errMsg)
        expect(status.error).to.be.true()
        expect(status['one'].error).to.be.true()
        expect(status['2'].error).to.be.false()
        consoleErrorStub.calledOnceWithExactly('Error: ', errMsg)
        status['2'].reportErr(errMsg)
        expect(status.error).to.be.true()
        expect(status['one'].error).to.be.true()
        expect(status['2'].error).to.be.true()
        consoleErrorStub.lastCall.calledWithExactly('Error: ', errMsg)
      })
    })

    it('resetting error on status[property} sets status[property].error to false but not resets status.error to false', () => {
      errMsgs.forEach(errMsg => {
        consoleErrorStub.resetHistory()
        status['one'].reportErr(errMsg)
        expect(status.error).to.be.true()
        expect(status['one'].error).to.be.true()
        expect(status['2'].error).to.be.false()
        consoleErrorStub.calledOnceWithExactly('Error: ', errMsg)
        status['2'].reportErr(errMsg)
        expect(status.error).to.be.true()
        expect(status['one'].error).to.be.true()
        expect(status['2'].error).to.be.true()
        consoleErrorStub.lastCall.calledWithExactly('Error: ', errMsg)
        status['one'].reset()
        expect(status.error).to.be.true()
        expect(status['one'].error).to.be.false()
        expect(status['2'].error).to.be.true()
        status['2'].reset()
        expect(status.error).to.be.true()
        expect(status['one'].error).to.be.false()
        expect(status['2'].error).to.be.false()
      })
    })

    it('resetting error on status sets both statur.error and all status[property].error to false', () => {
      errMsgs.forEach(errMsg => {
        consoleErrorStub.resetHistory()
        status['one'].reportErr(errMsg)
        status['2'].reportErr(errMsg)
        expect(status.error).to.be.true()
        expect(status['one'].error).to.be.true()
        expect(status['2'].error).to.be.true()
        consoleErrorStub.lastCall.calledWithExactly('Error: ', errMsg)
        status.reset()
        expect(status.error).to.be.false()
        expect(status['one'].error).to.be.false()
        expect(status['2'].error).to.be.false()
      })
    })
  })
})
