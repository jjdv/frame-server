validateMiddlewares = function(msDef, validateFn, status) {
  if (!msDef) return

  if (!Array.isArray(msDef)) msDef = [msDef]
  let mDef
  for (const index = 0; index < msDef.length; index++) {
    mDef = msDef[index]
    validateFn(mDef, index, status)
  }
}

module.exports = { validateMiddlewares }
