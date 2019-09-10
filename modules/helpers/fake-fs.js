module.exports = function FakeFs () {
  const fakeFilePaths = []
  const fakeDirPaths = []

  function addFakeFilePaths (filePaths) {
    if (!filePaths) return

    if (filePaths.constructor === Array)
      filePaths.forEach(fp => fakeFilePaths.push(fp))
    else fakeFilePaths.push(filePaths)
  }

  function addFakeDirPaths (dirPaths) {
    if (!dirPaths) return

    if (dirPaths.constructor === Array)
      dirPaths.forEach(dp => fakeDirPaths.push(dp))
    else fakeDirPaths.push(dirPaths)
  }

  function resetFakeFilePaths () {
    fakeFilePaths.length = 0
  }

  function resetFakeDirPaths () {
    fakeDirPaths.length = 0
  }

  function resetFakePaths () {
    resetFakeFilePaths()
    resetFakeDirPaths()
  }

  function fakeFsExistsSync (path) {
    return fakeFilePaths.includes(path) || fakeDirPaths.includes(path)
  }

  function fakeFsStatSync (path) {
    if (fakeFilePaths.includes(path)) return { isFile: () => true }
    else if (fakeDirPaths.includes(path)) return { isDirectory: () => true }
    return {}
  }

  this.addFakeFilePaths = addFakeFilePaths
  this.addFakeDirPaths = addFakeDirPaths
  this.resetFakeFilePaths = resetFakeFilePaths
  this.resetFakeDirPaths = resetFakeDirPaths
  this.resetFakePaths = resetFakePaths
  this.existsSync = fakeFsExistsSync
  this.statSync = fakeFsStatSync
}
