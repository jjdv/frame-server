
// creates getters & (warning) setters in obj for props in (typically private) propsObj
exports.createGetOnlyProps = function (obj, propsObj) {
  if (createPropsParsErr(obj, propsObj)) return

  for (let propName in propsObj) {
    Object.defineProperty(obj, propName, {
      enumerable: true,
      get: function () { return propsObj[propName] },
      set: function (value) {
        console.error(`Error: attempt to overwrite the read-only property "${propName}" with the value: `, value)
      }
    })
  }
}

exports.createReadOnlyProps = function (obj, propsObj) {
  if (createPropsParsErr(obj, propsObj)) return

  for (let propName in propsObj) {
    Object.defineProperty(obj, propName, {
      enumerable: true,
      value: propsObj[propName]
    })
  }
}

// if props is an object changes all props in this object to read only
// if props is string or array of strings they are considered as prop names in obj
exports.toReadOnlyProps = function (obj, props) {
  const status = new Status()
  objectErrCheck(obj, "base object ('obj')", 'toReadOnlyProps', status)
  if (status.error) return

  if (!props) for (let prop in obj) toReadOnlyProp(obj, prop)
  else {
    if (typeof props === 'string') toReadOnlyProp(obj, props)
    else if (!Array.isArray(props)) {
      props.forEach(prop => {
        if (prop && typeof prop === 'string') toReadOnlyProp(obj, prop)
      })
    } else console.error("Error: Properties format in 'toReadOnlyProps' must be string or array and not: ", props)
  }
}

//
// -------------------------------------------------------------------------------
// supporting functions
// -------------------------------------------------------------------------------

// class creating instance to report potential several errors and get final error status
function Status () {
  let error = false

  Object.defineProperties(this, {
    reportErr: {
      value: function (...errMsgs) {
        console.error(...errMsgs)
        error = true
      }
    },
    error: {
      get: function () { return error }
    }
  })
}

function createPropsParsErr (obj, propsObj) {
  const status = new Status()
  objectErrCheck(obj, "base object ('obj')", 'createGetOnlyProps', status)
  objectErrCheck(propsObj, "properties object ('propsObj')", 'createGetOnlyProps', status)

  return status.error
}

function objectErrCheck (obj, objName, recipientName, status) {
  if (!obj) status.reportErr(`Error: No ${objName} provided to ${recipientName}`)
  else if (typeof obj !== 'object') status.reportErr(`Error: Invalid ${objName} provided to ${recipientName}: `, obj)
}

// changes prop in obj to read only
function toReadOnlyProp (obj, prop) {
  const descr = Object.getOwnPropertyDescriptor(obj, prop)
  if (descr.get || descr.set) return

  Object.defineProperty(obj, prop, {
    writable: false,
    configurable: false
  })
}