class DataTester {
  constructor (it, expect, getResult, checkResult, logStub) {
    this._it = it
    this._expect = expect
    this._getResult = getResult
    this._checkResult = checkResult
    this._logStub = logStub
  }

  test (testData, checkLogs = true) {
    testData.forEach(td => {
      this._it(td.title, () => {
        if (Array.isArray(td.definition)) {
          td.definition.forEach(tdEl => {
            this._logStub.resetHistory()
            this.checkTestDataElement(tdEl, td, checkLogs)
          })
        } else this.checkTestDataElement(td.definition, td, checkLogs)
      })
    })
  }

  checkTestDataElement (tdEl, td, checkLogs) {
    let { result: referenceResult, logs } = tdEl
    if (!referenceResult) referenceResult = td.result
    if (!logs) logs = td.logs

    let actualResult = this._getResult(tdEl)
    this._checkResult(actualResult, referenceResult, this._expect)
    if (checkLogs && this._logStub)
      checkLogsMatch(logs, this._logStub, this._expect)
  }
}

module.exports = DataTester

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

function checkLogsMatch (logs, logStub, expect) {
  if (logs) {
    if (Array.isArray(logs)) {
      expect(logs.length).to.equal(logStub.args.length)
      logs.forEach((log, logIndx) =>
        checkLogMatch(log, logStub.getCall(logIndx))
      )
    } else {
      logStub.should.have.been.calledOnce()
      checkLogMatch(logs, logStub.getCall(0))
    }
  } else logStub.should.have.not.been.called()
}

function checkLogMatch (logs, logStub) {
  if (propDefined('args', logs)) {
    logStub.should.have.been.calledWithExactly(...logs.args)
  } else logStub.should.have.been.calledWithExactly(logs)
}

function propDefined (prop, obj) {
  return obj && typeof obj === 'object' && obj[prop]
}
