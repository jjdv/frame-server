class DataTester {
  constructor (it, expect, getResult, checkResult, errorStub) {
    this._it = it
    this._expect = expect
    this._getResult = getResult
    this._checkResult = checkResult
    this._errorStub = errorStub
  }

  test (testData) {
    testData.forEach(td => {
      this._it(td.title, () => {
        if (Array.isArray(td.definition)) {
          td.definition.forEach(tdEl => {
            this._errorStub.resetHistory()
            this.checkTestDataElement(tdEl, td)
          })
        } else this.checkTestDataElement(td.definition, td)
      })
    })
  }

  checkTestDataElement (tdEl, td) {
    let { result: referenceResult, errMsg } = tdEl
    if (!referenceResult) referenceResult = td.result
    if (!errMsg) errMsg = td.errMsg

    let actualResult = this._getResult(tdEl)
    this._checkResult(actualResult, referenceResult, this._expect)
    if (errMsg && this._errorStub) {
      this.checkErrMessages(errMsg)
    }
  }

  checkErrMessages (errMsgs) {
    if (Array.isArray(errMsgs)) {
      this._expect(errMsgs.length).to.equal(this._errorStub.args.length)
      errMsgs.forEach((errM, mIndx) =>
        checkErrMsg(errM, this._errorStub.getCall(mIndx))
      )
    } else checkErrMsg(errMsgs, this._errorStub.getCall(0))
  }
}

module.exports = DataTester

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

function checkErrMsg (errMsg, errMsgStub) {
  if (!errMsg) {
    errMsgStub.should.have.not.been.called()
    return
  }

  if (argsDefined(errMsg)) {
    errMsgStub.should.have.been.calledWithExactly(...errMsg.args)
  } else errMsgStub.should.have.been.calledWithExactly(errMsg)
}

function argsDefined (val) {
  return val && typeof val === 'object' && val.args
}
