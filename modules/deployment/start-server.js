
function startServer (app, configPort) {
  const PORT = process.env.PORT || configPort
  const uriDesc = process.env.PORT ? `port: ${PORT}` : `http://localhost:${PORT}`
  app.listen(PORT, () => console.log(`Server listening on ${uriDesc} ...`))
}

module.exports = startServer
