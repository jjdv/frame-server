const emptyMiddlewares = {
  middlewaresLength: 0
}

const emptyNamesTestData = [null, false, undefined, NaN, ''].map(name => ({
  middlewaresName: name
}))

const emptyNamesTestDefinition = {
  title:
    "returns instance with property 'middlewares' being an empty array and reports error in case of missing (falsy) name argment",
  definition: emptyNamesTestData,
  errMsg: {
    args: [
      'Error: ',
      "Missing name of the 'middlewares group' with definition:",
      undefined
    ]
  },
  result: emptyMiddlewares
}

const nonStringNamesTestData = [{}, []].map(name => ({
  middlewaresName: name,
  middlewaresDef: 'middlewares definition',
  errMsg: {
    args: [
      'Error: ',
      "The name of the 'middlewares group', with definition:",
      'middlewares definition',
      ' must be a string and not: ',
      name
    ]
  }
}))

const nonStringNamesTestDefinition = {
  title:
    "returns instance with property 'middlewares' being an empty array and reports error in case of non-string name argument",
  definition: nonStringNamesTestData,
  result: emptyMiddlewares
}

const emptyMiddlewaresTestData = [null, false, undefined, NaN, '', {}, []].map(
  def => ({
    middlewaresName: 'Some Name',
    middlewaresDef: def,
    errMsg: {
      args: [
        'Error: ',
        'Invalid middlewares definition: ',
        def,
        "in the middleware 'Some Name'."
      ]
    }
  })
)

const emptyMiddlewaresDefTestDefinition = {
  title:
    "returns instance with properties 'name' and 'middlewares' (empty array) and reports error in case of empty middlewares definition",
  definition: emptyMiddlewaresTestData,
  result: {
    middlewaresLength: 0,
    name: 'Some Name'
  }
}

const invalidMiddlewareTestData1 = {
  middlewaresName: 'SomeName1',
  middlewaresDef: { test: 'abc' },
  errMsg: {
    args: [
      'Error: Invalid format of the middleware: ',
      undefined,
      `in the middleware: 'SomeName1-element1'`
    ]
  },
  result: {
    middlewaresLength: 1,
    name: 'SomeName1',
    applyMsg: undefined
  }
}

const invalidMiddlewareTestData2 = {
  middlewaresName: 'SomeName2',
  middlewaresDef: [null, []],
  applyMsg: 'The message to be used',
  errMsg: [
    {
      args: [
        'Error: Invalid format of the middleware: ',
        [],
        "in the middleware: 'SomeName2-element2'"
      ]
    },
    {
      args: [
        'Error: ',
        "No middleware function provided for the middleware: 'SomeName2-element2'."
      ]
    }
  ],
  result: {
    middlewaresLength: 1,
    name: 'SomeName2',
    applyMsg: 'The message to be used'
  }
}

const invalidMiddlewaresDefTestDefinition = {
  title:
    "reports error and returns instance with properties 'name', 'middlewares', 'applyMsg' in case of invalid middlewares definition",
  definition: [invalidMiddlewareTestData1, invalidMiddlewareTestData2]
}

module.exports = [
  emptyNamesTestDefinition,
  nonStringNamesTestDefinition,
  emptyMiddlewaresDefTestDefinition,
  invalidMiddlewaresDefTestDefinition
]
