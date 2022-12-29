const request = require("supertest");
require('dotenv').config();

describe("test suite example", () => {
    test("POST /user (registrazione)", () => {
        const { app } = require("../app");

        /* //node-fetch sembra essere incompatibile con jest
        const fetch = require("node-fetch");
        fetch(
            'localhost:3000/user', 
            { method: 'POST', body: JSON.stringify({ email: 'noem', password: 'nopw' }), headers: { 'Content-Type': 'application/json' } }
        ).then(res => {
            expect(res.status).toEqual(400);
        })*/

        return request(app).post('/user/').send(JSON.stringify({ email: "AAFAFJAF", password: "JAJAJAJA" })).then(res => {
            expect(res.status).toEqual(400);
            app.close();
        });
    });
});
