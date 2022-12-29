const app = require("../app");
const request = require("supertest");

describe("test suite example", () => {
    test("test example", () => {
        const input = { a: 2, b: 3 };

        const output = 5;

        expect(input.a + input.b).toEqual(output);
        expect(-input.a + -input.b).toEqual(-output);
    });
});