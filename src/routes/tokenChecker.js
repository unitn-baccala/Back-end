const tokenChecker = function(req, res, next) {
    const token = req.body.token;
    
    if (token === null) {
        res.status(401).sned("token not provided");
    } else {
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
            if(err) {
                console.log(err);
                res.status(403).send("token not valid");
            } else {
                req.qualocosa = decoded;
                next(); //go to next route
            }
        });
    }
}

module.exports = tokenChecker;