function globalVars(req, res, next){
    const session = req.session || {}
    res.locals.currentUser = req.session?.user || null;
    res.locals.success = req.session?.success || null;
    res.locals.error = req.session?.error || null;

    delete req.session.success;
    delete req.session.error;
    next();
}
export {globalVars}