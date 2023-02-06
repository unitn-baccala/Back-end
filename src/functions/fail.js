const failHandler = (res, resourceFail) => (code, msg) => {
    res.status(code).send({ msg: (resourceFail + msg)});
};

module.exports = failHandler;