const emptyNameDefinitions = [null, false, undefined, NaN, ''].map(def => ({
  middlewaresName: def,
  errMsg: {
    args: [
      'Error: ',
      "Missing name of the 'middlewares group' with definition:",
      undefined
    ]
  }
}))

const nonStringNameDefinitions = [{}, []].map(def => ({
  middlewaresName: def,
  middlewaresDef: 'middlewares definition',
  errMsg: {
    args: [
      'Error: ',
      "The name of the 'middlewares group', with definition:",
      'middlewares definition',
      ' must be a string and not: ',
      def
    ]
  }
}))

const emptyMiddlewares = {
  middlewares: []
}

const incorrectDefinitions = [
  {
    title:
      "returns instance with property 'middlewares' being an empty array and reports error in case of missing (falsy) name definition",
    definition: emptyNameDefinitions,
    result: emptyMiddlewares
  },
  {
    title:
      "returns instance with property 'middlewares' being an empty array and reports error in case of non-string name definition",
    definition: nonStringNameDefinitions,
    result: emptyMiddlewares
  }
]

module.exports = incorrectDefinitions
