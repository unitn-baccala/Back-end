const fail = (code, resourceFail, msg) => {
    res.status(code).send({ msg: (resourceFail + msg)});
};

module.exports = fail;