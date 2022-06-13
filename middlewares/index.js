const jwt = require('jsonwebtoken');

const checkIfAuthenticatedJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

const checkIfAuthenticated = (req, res, next) => { 
    if (req.session.user) {
        next()
    // else user will not be able to acccess the page
    } else {
        req.flash("error_messages", "You need to sign in to access this page");
        res.redirect('/users/login');
    }
}

const checkIfAdmin = (req, res, next) => {
    // we check if the user role is '1' => for admin 
    if (req.session.user.userrole == 1) {
        next()
    // else user will not be able to acccess the page
    } else {
        req.flash("warning_messages", "You need to be an admin to access this page");
        res.redirect('/users/profile');
    }
}


module.exports = {
    checkIfAuthenticated, checkIfAdmin, checkIfAuthenticatedJWT
}
