function setView (app, view) {
  if (!view) return
  if (view.engine) app.set('view engine', view.engine)
  if (view.dir) app.set('views', getViewDir(view.dir))
}

module.exports = setView

//
// -------------------------------------------------------------------------------
// supporting functions
// -------------------------------------------------------------------------------

const path = require('path')

function getViewDir (dir) {
  const rootDir = process.env.ROOT_DIR
  if (typeof dir === 'string') return path.resolve(rootDir, dir)
  else if (Array.isArray(dir)) {
    return dir.map(dirEl => path.resolve(rootDir, dirEl))
  }
}
