const emptyNameDefinitions = [null, false, undefined, {}, [], ''].map(def => ({
  definition: def,
  errMsg: {
    args: ['Error: ', 'Invalid middleware definition: ', def]
  }
}))

const emptyMiddlewaresDefinitions = [null, false, undefined, {}, [], ''].map(
  def => ({
    definition: def,
    errMsg: {
      args: ['Error: ', 'Invalid middleware definition: ', def]
    }
  })
)

const incorrectDefinitions = [
  {
    title:
      'returns instance with middlewareFn null and reports error in case of empty definition',
    definition: emptyNameDefinitions,
    result: {}
  },
  {
    title:
      'returns instance with middlewareFn null and reports error in case of empty definition',
    definition: emptyMiddlewaresDefinitions,
    result: {}
  }
]

module.exports = incorrectDefinitions
