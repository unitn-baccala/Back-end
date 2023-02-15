const failureResponseHandler = (res, resourceFail) => (code, msg) => {
    res.status(code).send({ msg: (resourceFail + msg)});
};

module.exports = failureResponseHandler;