/* eslint-env mocha */
'use strict'

// class under test
const Middlewares = require('../../../modules/classes/middlewares')

// test environment
const { expect, sinon } = require('../../test-support/test-env')
const consoleErrorStub = sinon.stub(console, 'error')
const appSpy = { use: sinon.spy() }

const DataTester = require('../../test-support/data-tester.class')
const dataTester = new DataTester(
  it,
  expect,
  getResult,
  checkResult,
  consoleErrorStub
)

const {
  middlewaresTestData,
  normalizeResult
} = require('./test-support/middlewares-test-data')

// -----------------------------------------------------------------------
// test body
// -----------------------------------------------------------------------

describe('Middlewares', function () {
  after(() => {
    consoleErrorStub.restore()
  })

  describe('creation', function () {
    beforeEach(() => {
      consoleErrorStub.resetHistory()
    })

    dataTester.test(middlewaresTestData)
  })

  // describe('.apply()', () => {
  //   testApply()
  // })
})

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

function testApply () {
  beforeEach(async () => {
    appSpy.use.resetHistory()
  })

  it('does not call app if the middlewareFn is falsy', () => {
    const mdlw = new Middlewares({
      name: 'testName',
      middleware: null
    })
    mdlw.apply(appSpy, false)
    appSpy.use.should.have.not.been.called()
  })

  it('invokes app[this.type](this.middlewareFn) if this.routePaths does not exist', () => {
    const mdlw = new Middlewares({
      name: 'testName',
      middleware: () => 'testResult'
    })
    mdlw.apply(appSpy, false)
    appSpy.use.should.have.callCount(1)
    expect(appSpy.use.getCall(0).args.length).to.equal(1)
    appSpy.use.should.have.been.calledOnce()
    expect(appSpy.use.getCall(0).args.length).to.equal(1)
    expect(appSpy.use.args[0][0].toString()).to.equal(
      (() => 'testResult').toString()
    )
  })

  it('invokes app[this.type](this.routePaths, this.middlewareFn) if this.routePaths exists', () => {
    const mdlw = new Middlewares({
      name: 'testName',
      middleware: () => 'testResult',
      routePaths: '/api'
    })
    const consoleLogStub = sinon.stub(console, 'log')
    mdlw.apply(appSpy, false)
    consoleLogStub.restore()
    appSpy.use.should.have.callCount(1)
    expect(appSpy.use.getCall(0).args.length).to.equal(2)
    expect(appSpy.use.args[0][0]).to.equal('/api')
    expect(appSpy.use.args[0][1].toString()).to.equal(
      (() => 'testResult').toString()
    )
  })

  it('reports middleware use if invoked with 2nd argument true as .apply(app, true)', () => {
    const mdlw = new Middlewares({
      name: 'testName',
      middleware: () => 'testResult'
    })
    const consoleLogStub = sinon.stub(console, 'log')
    mdlw.apply(appSpy, true)
    mdlw.apply(appSpy)
    consoleLogStub.should.have.been.calledTwice()
    consoleLogStub.should.always.have.been.calledWithExactly(
      "The middleware 'testName' has been applied."
    )
    consoleLogStub.restore()
    appSpy.use.should.have.been.calledTwice()
    expect(appSpy.use.getCall(1).args.length).to.equal(1)
    expect(appSpy.use.args[0][0].toString()).to.equal(
      (() => 'testResult').toString()
    )
    expect(appSpy.use.getCall(1).args.length).to.equal(1)
    expect(appSpy.use.args[1][0].toString()).to.equal(
      (() => 'testResult').toString()
    )
  })
}
// ------------------------------------

function getResult (testDataElement) {
  return new Middlewares(
    testDataElement.middlewaresName,
    testDataElement.middlewaresDef,
    testDataElement.options,
    testDataElement.applyMsg
  )
}
function checkResult (actualResult, referenceResult, expect) {
  expect(actualResult.apply).to.exist()

  actualResult = normalizeResult(actualResult)
  expect(actualResult).to.deep.equal(referenceResult)
}
