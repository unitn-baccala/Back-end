const jwt = require('jsonwebtoken');

const tokenChecker = function(req, res, next) {
    const token = req.body.token || req.get('Authorization').split(' ')[1];
    if (!token) {
        res.status(401).send({ msg: "token not provided" });
    } else {
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
            if(err) {
                //console.log(err);
                res.status(401).send({ msg: "token not valid" });
            } else {
                req.body.jwt_payload = decoded;
                next(); //go to next route
            }
        });
    }
}

module.exports = tokenChecker;