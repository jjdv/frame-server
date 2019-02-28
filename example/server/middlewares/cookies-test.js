module.exports = function(req, res, next) {
    if (req.params.cmd == 'set' && req.params.name && req.params.value) res.cookie(req.params.name, req.params.value)
    else if (req.params.cmd == 'delete' && req.params.name) res.clearCookie(req.params.name)

    res.render('cookies-test', {
        cookies: JSON.stringify(req.cookies),
        signedCookies: JSON.stringify(req.signedCookies),
        ...req.params
    })
}