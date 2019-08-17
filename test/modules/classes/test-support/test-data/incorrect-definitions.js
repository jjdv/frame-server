const wrongMDef1 = {
  name: '',
  type: 'get',
  routePaths: ['/route/path', {}, /abc*/],
  middleware: '/test'
}

const errMsg1 = [
  {
    args: ['Error: ', 'Cannot find "C:\\test" specified by the \'\' as "/test"']
  },
  {
    args: [
      'Error: ',
      "Missing name of the 'middleware' with definition:",
      wrongMDef1
    ]
  },
  {
    args: ['Error: ', "No middleware function provided for the middleware: ''."]
  },
  {
    args: ['Error: ', "Wrong path format in ''."]
  }
]

const wrongMDef2 = {
  name: { name: 'wrongDef2' },
  routePaths: [],
  middleware: {}
}

const errMsg2 = [
  {
    args: [
      'Error: Invalid format of the middleware: ',
      {},
      `in the middleware: '${{ name: 'wrongDef2' }}'`
    ]
  },
  {
    args: [
      'Error: ',
      "The name of the 'middleware', with definition:",
      wrongMDef2,
      ' must be a string and not: ',
      { name: 'wrongDef2' }
    ]
  },
  {
    args: [
      'Error: ',
      `No middleware function provided for the middleware: '${{
        name: 'wrongDef2'
      }}'.`
    ]
  },
  {
    args: [
      'Error: ',
      `Empty array as routePaths in the middleware: '${{
        name: 'wrongDef2'
      }}'.`
    ]
  }
]

const incorrectDefinitions = {
  title:
    'returns instance with middlewareFn null and reports error(s) in case of incorrect definition',
  definition: [
    {
      name: 'myMiddlewareName1',
      type: 'user',
      routePaths: '/route/path',
      middleware: () => '',
      result: {
        name: 'myMiddlewareName1',
        middlewareFn: null
      },
      errMsg: {
        args: [
          'Error: ',
          'Invalid middleware type: ',
          'user',
          'provided for the middleware: myMiddlewareName1.'
        ]
      }
    },
    {
      ...wrongMDef1,
      options: {
        rootDir: 'C:\\testDir'
      },
      result: {
        name: '',
        middlewareFn: null
      },
      errMsg: errMsg1
    },
    {
      ...wrongMDef2,
      result: {
        name: { name: 'wrongDef2' },
        middlewareFn: null
      },
      errMsg: errMsg2
    }
  ]
}

module.exports = incorrectDefinitions
