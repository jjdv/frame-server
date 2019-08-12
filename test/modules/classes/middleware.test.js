/* eslint-env mocha */
'use strict'

// test environment
const path = require('path')
const { expect, sinon } = require('../../test-env')

const { isEmpty } = require('../../../modules/helpers/basic')

// class under test
const Middleware = require('../../../modules/classes/middleware')

// test variables
const middlewareTestData = require('./test-support/middleware.test.data')
let consoleErrorStub, res

// --------------------------------------------------------
// ------------ test body -------------------------------
// --------------------------------------------------------

describe('Middleware', function() {
  before(() => {
    consoleErrorStub = sinon.stub(console, 'error')
  })

  beforeEach(async () => {
    consoleErrorStub.resetHistory()
  })

  after(() => {
    consoleErrorStub.restore()
  })

  describe('.fromDef()', function() {
    middlewareTestData.forEach(mtd => {
      it(mtd.title, () => {
        if (Array.isArray(mtd.definition)) {
          mtd.definition.forEach(mDef => {
            consoleErrorStub.resetHistory()
            checkDefinitionResult(mDef, mtd)
          })
        } else checkDefinitionResult(mtd.definition, mtd)
      })
    })
  })
})

// ---------------------------------------------------------------
// helpers
// ---------------------------------------------------------------

function checkDefinitionResult(mDef, mtd) {
  res = argsDefined(mDef)
    ? Middleware.fromDef(...mDef.args)
    : Middleware.fromDef(mDef)
  expect(res.apply).to.exist()
  expect(mComparable(res)).to.deep.equal(mComparable(mtd.result))
  if (!res.middlewareFn) checkErrMessages(mtd.errMsg)
}

// middleware comparable
function mComparable(m) {
  const mC = Object.assign({}, m)
  mC.middlewareFn = mC.middlewareFn
    ? mC.middlewareFn.toString()
    : mC.middlewareFn
}

function checkErrMessages(errMsgs) {
  if (Array.isArray(errMsgs))
    errMsgs.forEach((errM, mIndx) =>
      checkErrMsg(errM, consoleErrorStub.getCall(mIndx))
    )
  else checkErrMsg(errMsgs, consoleErrorStub)
}

function checkErrMsg(errMsg, errMsgStub) {
  if (argsDefined(errMsg))
    expect(errMsgStub.calledOnceWithExactly(...errMsg.args)).to.be.true()
  else expect(errMsgStub.calledOnceWithExactly(errMsg)).to.be.true()
}

function argsDefined(val) {
  return val && typeof val === 'object' && val.args
}
