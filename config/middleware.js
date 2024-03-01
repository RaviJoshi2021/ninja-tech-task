// middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        let token = req.headers.Authorization || req.headers.authorization;
        if (!token) return res.status(401).send('Access denied');
        token = token.replace("Bearer ", "")
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        req.user = verified;
        next();
    } catch (error) {
        console.log(error)
        res.status(401).send('Invalid Token ss');
    }
};

const permit = (...permittedRoles) => {
    return (req, res, next) => {
        if (req.user && permittedRoles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).send('You are not authrozired');
        }
    };
};

module.exports = { auth, permit };