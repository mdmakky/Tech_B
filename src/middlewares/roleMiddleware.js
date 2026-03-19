function requireAdmin(req, res, next){
    if(!req.session.user|| req.session.user.role !== 'admin'){
        return res.status(403).render("error", {
            title: "Access Denied!!",
            message: "You have no permission to access this content."
        })
    }
}
next()

export {requireAdmin} 