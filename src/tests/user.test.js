const request = require('./request'); //for http requests

const post = request.post('/user'), del = request.del('/user');

let server, mongoose;

const post_data = [
    [ 201, { email: 'marco.rossi@example.com', password: 'PasswordSicura42' } ],
    [ 400, { email: 'marco.rossi@example.com', password: 'PasswordSicura42' } ],   // repeat valid data
    [ 400, { email: 'marco.rossi@example.com', password: 'badpw' } ],
    [ 400, { email: 'marco.rossi@example.com', password: 'PasswordSicura43' } ],   // repeat valid email, different password
    //invalid data
    [ 400, { email: 'badem', password: 'badpw' } ],
    [ 400, { email: null, password: null } ],
    [ 400, { } ], 
    [ 400, { email: 'badem' } ],
    [ 400, { email: 'badem', password: 'PasswordSicura42' } ],
    [ 400, { password: 'PasswordSicura42' } ],
    [ 400, { password: 'badpw' } ],
    [ 400, { email: 'giovanni.bianchi@example.com' } ],                            // vaild (& unique) email but no pw
    [ 400, { email: 'giovanni.bianchi@example.com', password: 'badpw' } ],         // vaild (& unique) email but invalid pw
];
const delete_data = (
    [
        [ 400, { email: 'marco.rossi@example.com', password: 'PasswordSicura43' } ],
        [ 400, { email: 'marco.rossi@example.com' } ],
        [ 400, { email: 'marco.rossi@example.com', password: null } ],
    ].concat(
        post_data.map(a => (a[0] == 201 ? [200, a[1]] : a))
    )
);

describe("/user", () => {
    beforeAll(async () => {
        let app = require("../app");
        server = app.server;
        mongoose = require('mongoose');
        await app.mongodb_connection_promise;
        await Promise.allSettled([
            del(200, { email: 'marco.rossi@example.com', password: 'PasswordSicura42' }),
        ]);
    });
    
    test.each(post_data)('POST (account registration) %d, %o', post);
    test.each(delete_data)('DELETE (account deletion) %d, %o', del);
    
    afterAll(async () => {
        server.close();
        await mongoose.disconnect();
    });
});


