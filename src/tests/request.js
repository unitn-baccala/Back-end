const bent = require('bent');
const socket = 'http://localhost:3000';
const make_method = method => path => async (code, data) => await bent(socket, method, 'json', code) (path, data);
const post = make_method('POST'), del = make_method('DELETE'), get = make_method('GET');

const test_credentials = {
    email: "test.user@for.tests.com",
    password: "PasswordSicura23",
    business_name: "Nome Ristorante Test",
};
//headers={Authorization: "Bearer " + jwt}
// creates the user if it does not exist, then returns its jwt
const init_test_auth = async () => {
    await Promise.allSettled([
        post('/api/user')(201, test_credentials)
    ]);
    return await post('/api/user/login')(200, test_credentials);
};
const make_auth_method = method => path => jwt => async (code, data) => bent(socket, method, 'json', code) (path, data, { Authorization: "Bearer " + jwt.token });
const auth_post = make_auth_method('POST'), auth_del = make_auth_method('DELETE'), auth_get = make_auth_method('GET');

module.exports = { post, del, get, init_test_auth, test_credentials, auth_post, auth_del, auth_get };