function globalVars(req, res, next){
    res.locals.currentUser = req.session?.user || null;
    res.locals.success = req.session?.success || null;
    res.locals.error = req.session?.error || null;

    if (req.session) {
        delete req.session.success;
        delete req.session.error;
    }
    next();
}
export {globalVars}