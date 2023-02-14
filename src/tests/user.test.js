const request = require('./request'); //for http requests
const User = require('../models/user');
const api_path = '/api/user';

const post = request.post(api_path), del = request.auth_del(api_path);

const valid_document = { email: 'marco.rossi@example.com', password: 'PasswordSicura42', business_name: 'Da Marco' };

const post_data = [
    [ 201, valid_document ],
    [ 400, valid_document ],   // repeat valid data
    [ 400, { email: 'marco.rossi@example.com', password: 'PasswordSicura43', business_name: 'Da Marco' } ],   // repeat valid email, different password
    [ 400, { email: 'marco.rossi@example.com', password: 'badpw', business_name: 'Da Marco' } ],
    //invalid data
    [ 400, { email: 'badem', password: 'badpw', business_name: 'bad' } ],
    [ 400, { email: 'badem', password: 'badpw' } ],
    [ 400, { email: null, password: null, business_name: null } ],
    [ 400, { } ], 
    [ 400, null ],
    [ 400, { email: 'badem' } ],
    [ 400, { email: 'badem', password: 'PasswordSicura43', business_name: 'Da Marco' } ],
    [ 400, { email: 'badem', password: 'PasswordSicura42' } ],
    [ 400, { password: 'PasswordSicura42' } ],
    [ 400, { password: 'badpw' } ],
    [ 400, { email: 'giovanni.bianchi@example.com', business_name: 'Da Giovanni'} ],                                // no pw
    [ 400, { email: 'giovanni.bianchi@example.com', business_name: 'Da Giovanni', password: 'badpw' } ],            // invalid pw
    [ 400, { email: 'giovanni.bianchi@example.com', password: 'OttimaPassword1234' } ],                             // no business_name
    [ 400, { email: 'giovanni.bianchi@example.com', password: 'OttimaPassword1234', business_name: 'Da Marco' } ],  // business_name taken
];
const delete_data = (
    [// [auth_response_code, delete_status_code, body]
        [ 200, 400, { email: 'marco.rossi@example.com', password: 'PasswordSicura43' } ],
        [ 200, 400, { password: 'PasswordSicura42' } ],
        [ 200, 400, { email: 'marco.rossi@example.com' } ],
        [ 200, 400, { email: 'marco.rossi@example.com', password: null } ],
        [ 200, 400, { email: 'giovanni.bianchi@example.com', password: 'OttimaPassword1234' } ],
        [ 200, 200, valid_document ],
        [ 404, 401, valid_document ],
    ]
);

let server, mongoose, jwt;
describe(api_path, () => {
    beforeAll(async () => {
        let app = require("../app");
        server = app.server;
        mongoose = require('mongoose');
        
        await User.deleteOne({ email: valid_document.email });
    });

    test.each(post_data)('POST (registration) %d, %o', async (c,d) => await post(c,d));

    test.each(delete_data)('DELETE (deregistration) %d, %d, %o', async (auth_code, del_code,d) => {
        let jwt = await request.post('/api/user/login')(auth_code, valid_document);
        await del(jwt)(del_code,d);
    });
    test('GET success', async () => {
        let jwt = await request.init_test_auth();
        await request.auth_get(api_path)(jwt)(200, {});
    });
    test('GET fail', async () => {
        await request.get(api_path)(401, {});
    });
    
    afterAll(async () => {
        server.close();
        await mongoose.disconnect();
    });
});


