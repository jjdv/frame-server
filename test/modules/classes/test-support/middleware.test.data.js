const middlewareTestData = [
  {
    title: 'returns empty class in case of empty definition',
    definition: [null, false, undefined, {}, [], ''],
    result: null,
    errMsg: {
      args: ['Error: ', 'A siteMiddleware definition cannot be empty.']
    }
  }
  // {
  //   title: '',
  //   definition: {

  //   },
  //   result: null,
  //   errMsg: ''
  // }
]

module.exports = middlewareTestData
