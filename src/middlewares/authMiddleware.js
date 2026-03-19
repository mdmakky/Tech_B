function requireAuth(req, res, next){
    if(!req.session.user){
        req.session.returnTo = req.originalUrl
        req.session.error = "Please login to continue"
        return res.redirect('/auth/login')
    }
    next()

}

export {requireAuth}