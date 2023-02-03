require('dotenv').config();
const bent = require('bent'); //for http requests
const { server } = require("../app");
const mongoose = require('mongoose');

const post = (code) => bent('http://localhost:3000/', 'POST', 'string', code);
const del = (code) => bent('http://localhost:3000/', 'DELETE', 'string', code);

describe("/user", () => {
    beforeAll(() => Promise.allSettled([
        del(200)('user/', { email: 'marco.rossi@example.com', password: 'PasswordSicura42' }),
    ]));
    
    test("POST (registrazione)", async () => {
        // expecting this to succeed
        await post(201)('user/', { email: 'marco.rossi@example.com', password: 'PasswordSicura42' });   // provide valid data

        // expecting these to fail:
            // repeated email address
        await post(400)('user/', { email: 'marco.rossi@example.com', password: 'PasswordSicura42' });   // repeat valid data
        await post(400)('user/', { email: 'marco.rossi@example.com', password: 'PasswordSicura43' });   // repeat valid email, different password
        await post(400)('user/', { email: 'marco.rossi@example.com', password: 'badpw' });              // repeat valid email, bad password
            // invalid email
        await post(400)('user/', { email: 'badem', password: 'badpw' });                                // provide invalid data
        await post(400)('user/', { email: null, password: null });                                      // provide null data
        await post(400)('user/', { });                                                                  // provide no data
        await post(400)('user/', { email: 'badem' });                                                   // provide invalid email & no pw
        await post(400)('user/', { email: 'badem', password: 'PasswordSicura42' });                     // provide invalid email but valid pw
        await post(400)('user/', { password: 'PasswordSicura42' });                                     // provide no email but valid pw
        await post(400)('user/', { password: 'badpw' });                                                // provide no email & invalid pw
            //valid email, invalid password
        await post(400)('user/', { email: 'giovanni.bianchi@example.com' });                            // provide vaild (& unique) email but no pw
        await post(400)('user/', { email: 'giovanni.bianchi@example.com', password: 'badpw' });         // provide vaild (& unique) email but invalid pw
    });

    test("DELETE (deregistrazione)", async () => {
        // invalid email & pw
        await del(400)('user/', { email: 'noem', password: 'nopw' });
        await del(400)('user/', { password: 'nopw' });
        await del(400)('user/', { email: 'noem'});
        await del(400)('user/', { email: null, password: null });
        await del(400)('user/', { });

        await del(400)('user/', { email: 'noem', password: 'PasswordSicura42' });                       // invalid email but valid pw
        await del(400)('user/', { email: 'marco.rossi@example.com', password: 'PasswordSbagliata' });   // valid email but invalid pw
        await del(400)('user/', { email: 'marco.rossi@example.com' });
        await del(400)('user/', { email: 'marco.rossi@example.com', password: null });
        await del(200)('user/', { email: 'marco.rossi@example.com', password: 'PasswordSicura42' });    // valid email & pw -> success
        await del(400)('user/', { email: 'marco.rossi@example.com', password: 'PasswordSicura42' });    // already deleted
    });

    afterAll(() => {
        server.close();
        mongoose.disconnect();
    });
});


