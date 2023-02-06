const bent = require('bent');
const socket = 'http://localhost:3000';
const make_method = method => path => async (code, data) => await bent(socket, method, 'json', code) (path, data);
const post = make_method('POST'), del = make_method('DELETE'), get = make_method('GET');

const authenticate = data => bent(socket, 'POST', 'json', 200) ('/api/authenticate', data);
const test_credentials = {
    email: "test.user@for.tests.com",
    password: "PasswordSicura23",
    business_name: "Nome Ristorante Test",
};
// creates the user if it does not exist, then returns its jwt
const init_test_auth = async () => {
    await Promise.allSettled([
        post('/api/user')(201, test_credentials)
    ]);
    return await authenticate(test_credentials);
};
const make_auth_method = method => path => jwt => async (code, data) => bent(socket, method, 'json', code) (path, {...data, ...jwt});
const auth_post = make_auth_method('POST'), auth_del = make_auth_method('DELETE');

module.exports = { post, del, get, init_test_auth, auth_post, auth_del, test_credentials };