function globalVars(req, res, next){
    const session = req.session || {}
    res.locals.currentUser = res.session?.user || null;
    res.locals.success = res.session?.success || null;
    res.locals.error = res.session?.error || null;

    delete req.session.success;
    delete req.session.error;
    next();
}
export {globalVars}