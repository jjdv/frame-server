module.exports = function(req, res, next) {
    const reqType = req.method + req.params.type
    switch (reqType) {
        case 'GETurlencoded': res.render('form-urlencoded'); break
        case 'GETmultipart': res.render('form-multipart'); break
        case 'GETjson': res.render('form-json'); break
        case 'POSTdisplay': res.render('form-display', req.body); break
        case 'POSTjson': console.log('req.body from json: ', req.body); break
        default: next()
    }
}