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
          mtd.definition.forEach((mDef, index) => {
            consoleErrorStub.resetHistory()
            const result = arrElOrArgFn(mtd.result)
            const errMsg = arrElOrArgFn(mtd.errMsg)
            checkDefinitionResult(mDef, result(index), errMsg(index))
          })
        } else checkDefinitionResult(mtd.definition, mtd.result, mtd.errMsg)
      })
    })
  })
})

// ---------------------------------------------------------------
// helpers
// ---------------------------------------------------------------

function checkDefinitionResult(mDef, result, errMsg) {
  const options = mDef && typeof mDef === 'object' ? mDef.options : null
  res = new Middleware(mDef, options)

  expect(res.apply).to.exist()
  expect(mComparable(res)).to.deep.equal(mComparable(result))
  if (!res.middlewareFn) {
    checkErrMessages(errMsg)
  }
}

// middleware comparable
function mComparable(m) {
  const mC = Object.assign({}, m)
  if (m.middlewareFn) mC.middlewareFn = mC.middlewareFn.toString()
  return mC
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

function arrElOrArgFn(arg) {
  return Array.isArray(arg) ? indx => arg[indx] : () => arg
}
