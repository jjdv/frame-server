validateDefs = function(defs, validateFn, status) {
  if (!defs) return

  if (!Array.isArray(defs)) defs = [defs]
  defs.forEach((def, index) => validateFn(def, index, status))
}

module.exports = { validateDefs }
