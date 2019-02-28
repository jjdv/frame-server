module.exports = function(req, res){
    if (req.session.page_views){
        req.session.page_views++;
        res.send("<p>You visited this page " + req.session.page_views + " times.</p><p>Refresh the page to see the session in action.</p>")
    } else {
        req.session.page_views = 1;
        res.send("<p>Welcome to this page for the first time!</p><p>Refresh the page to see the session in action.</p>")
    }
}