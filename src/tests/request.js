const bent = require('bent');
const socket = 'http://localhost:3000';
const make_method = method => path => async (code, data) => await bent(socket, method, 'json', code) (path, data);
const make_auth_method = method => path => jwt => async (code, data) => bent(socket, method, 'json', code) (path, data, { Authorization: "Bearer " + jwt.token });

const post = make_method('POST'), del = make_method('DELETE'), get = make_method('GET');
const auth_post = make_auth_method('POST'), auth_del = make_auth_method('DELETE'), auth_get = make_auth_method('GET');

const User = require('../models/user');

const test_credentials = {
    email: "test.user@for.tests.com",
    password: "PasswordSicura23",
    business_name: "Nome Ristorante Test",
};

// creates the user if it does not exist, then returns its jwt
const init_test_auth = async () => {
    //user is created with a request and not directly through the database because the password needs to be hashed
    await Promise.allSettled([ //Promise.allSettled makes sure no error is thrown even when the POST fails (when the user is already there)
        post('/api/user')(201, test_credentials)
    ]);

    const test_user = await User.findOne({email: test_credentials.email}).exec();
    const jwt = await post('/api/user/login')(200, test_credentials);
    return { jwt, test_user };
};



module.exports = { post, del, get, init_test_auth, auth_post, auth_del, auth_get };