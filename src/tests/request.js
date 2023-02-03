const bent = require('bent');

const make_method = (method) => (path) => (code, data) => bent('http://localhost:3000', method, 'string', code) (path, data);
const post = make_method('POST'), del = make_method('DELETE'), get = make_method('GET');

module.exports = { post, del, get };