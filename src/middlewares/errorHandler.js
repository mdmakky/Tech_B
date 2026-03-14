function notFound(req, res) {
    res.status(404).render("error/error", {
        title: "Page Not Found!!!",
        message: "Sorry, the page you are looking for does not exist."
    });
}

function serverError(err, req, res, next) {
    console.error(err.stack);
    res.status(500).render("error/error", {
        title: "Server Error!!",
        message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong."
    });
}

export { notFound, serverError };