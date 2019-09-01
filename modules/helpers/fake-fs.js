const fakeFilePaths = []
const fakeDirPaths = []

function resetFakePaths () {
  fakeFilePaths.length = 0
  fakeDirPaths.length = 0
}

function addFakeFilePaths (filePaths) {
  if (filePaths.constructor === Array)
    filePaths.forEach(fp => fakeFilePaths.push(fp))
  else fakeFilePaths.push(filePaths)
}

function addFakeDirPaths (dirPaths) {
  if (dirPaths.constructor === Array)
    dirPaths.forEach(dp => fakeDirPaths.push(dp))
  else fakeDirPaths.push(dirPaths)
}

function fakeFsExistsSync (path) {
  return fakeFilePaths.includes(path) || fakeDirPaths.includes(path)
}

function fakeFsStatSync (path) {
  if (fakeFilePaths.includes(path)) return { isFile: () => true }
  else if (fakeDirPaths.includes(path)) return { isDirectory: () => true }
  return {}
}

const fakeFs = {
  existsSync: fakeFsExistsSync,
  statSync: fakeFsStatSync
}

module.exports = { fakeFs, resetFakePaths, addFakeDirPaths, addFakeFilePaths }
