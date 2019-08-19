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

// -----------------------------------------------------------------------
// test body
// -----------------------------------------------------------------------

describe('instance of Status', function() {
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

  describe('with no props', function() {
    testNoProps()
  })

  describe('with invalid props', function() {
    testInvalidProps()
  })

  describe('with valid and invalid props', function() {
    testMixedProps()
  })
})

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

function testNoProps() {
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
    consoleErrorStub.should.have.been.calledOnceWithExactly('Error: ', errMsg)
  })

  it('does not try report error if the error message is missing', () => {
    status.reportErr()
    expect(status.error).to.be.true()
    consoleErrorStub.should.have.not.been.called()
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
      consoleErrorStub.should.have.been.calledOnceWithExactly('Error: ', errMsg)
    })
  })
}

function testInvalidProps() {
  it('returns empty object and reports invalid arguments for creating Status instance', () => {
    invalidStatusArgs.forEach(arg => {
      consoleErrorStub.resetHistory()
      status = new Status(arg)
      expect(Object.keys(status).length).to.equal(0)
      consoleErrorStub.should.have.been.calledOnceWithExactly(
        'Error: Invalid arguments for creating Status instance:',
        arg,
        '\nExpected a non-empty string array ...'
      )
    })
  })
}

function testMixedProps() {
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
      consoleErrorStub.should.have.been.calledWithExactly(
        'Error: Invalid property name for creating Status instance: ',
        invalidSProp,
        '\nExpected non-empty string ... Property skipped.'
      )
    })
  })

  it('reporting error multiple times keeps error property true and logs all errors to console.error', () => {
    errMsgs.forEach(errMsg => {
      consoleErrorStub.resetHistory()
      status.reportErr(errMsg)
      expect(status.error).to.be.true()
      consoleErrorStub.should.have.been.calledOnceWithExactly('Error: ', errMsg)
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
      consoleErrorStub.should.have.been.calledOnceWithExactly('Error: ', errMsg)
      status['2'].reportErr(errMsg)
      expect(status.error).to.be.true()
      expect(status['one'].error).to.be.true()
      expect(status['2'].error).to.be.true()
      consoleErrorStub.lastCall.should.have.been.calledWithExactly(
        'Error: ',
        errMsg
      )
    })
  })

  it('does not try report error if the error message is missing', () => {
    status['one'].reportErr()
    status['2'].reportErr()
    expect(status.error).to.be.true()
    consoleErrorStub.should.have.not.been.called()
  })

  it('resetting error on status[property} sets status[property].error to false but not resets status.error to false', () => {
    errMsgs.forEach(errMsg => {
      consoleErrorStub.resetHistory()
      status['one'].reportErr(errMsg)
      expect(status.error).to.be.true()
      expect(status['one'].error).to.be.true()
      expect(status['2'].error).to.be.false()
      consoleErrorStub.should.have.been.calledOnceWithExactly('Error: ', errMsg)
      status['2'].reportErr(errMsg)
      expect(status.error).to.be.true()
      expect(status['one'].error).to.be.true()
      expect(status['2'].error).to.be.true()
      consoleErrorStub.lastCall.should.have.been.calledWithExactly(
        'Error: ',
        errMsg
      )
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
      consoleErrorStub.should.always.have.been.calledWithExactly(
        'Error: ',
        errMsg
      )
      status.reset()
      expect(status.error).to.be.false()
      expect(status['one'].error).to.be.false()
      expect(status['2'].error).to.be.false()
    })
  })
}
