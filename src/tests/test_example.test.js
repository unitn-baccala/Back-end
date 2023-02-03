require('dotenv').config();
const bent = require('bent'); //for http requests
const { server } = require("../app");
const mongoose = require('mongoose');

jest.setTimeout(10*1000);

const post = (code) => bent('http://localhost:3000/', 'POST', 'string', code);
const del = (code) => bent('http://localhost:3000/', 'DELETE', 'string', code);
/*
 * TODO:, or not to do testing, that is the question:
 * Whether 'tis nobler in the mind to suffer
 * The slings and arrows of outrageous fortune,
 * Or to take Arms against a Sea of troubles,
 * And by opposing end them: to die, to sleep
 * No more; and by a sleep, to say we end
 * The heart-ache, and the thousand natural shocks
 * That Flesh is heir to? 'Tis a consummation
 * Devoutly to be wished. To die, to sleep,
 * To sleep, perchance to Dream; aye, there's the rub,
 * For in that sleep of death, what dreams may come,
 * When we have shuffled off this mortal coil,
 * Must give us pause. There's the respect
 * That makes Calamity of so long life:
 * For who would bear the Whips and Scorns of time,
 * The Oppressor's wrong, the proud man's Contumely,
 * The pangs of dispised Love, the Law’s delay,
 * The insolence of Office, and the spurns
 * That patient merit of th'unworthy takes,
 * When he himself might his Quietus make
 * With a bare Bodkin? Who would Fardels bear,
 * To grunt and sweat under a weary life,
 * But that the dread of something after death,
 * The undiscovered country, from whose bourn
 * No traveller returns, puzzles the will,
 * And makes us rather bear those ills we have,
 * Than fly to others that we know not of?
 * Thus conscience does make cowards of us all,
 * And thus the native hue of Resolution
 * Is sicklied o'er, with the pale cast of Thought,
 * And enterprises of great pitch and moment,
 * With this regard their Currents turn awry,
 * And lose the name of Action. Soft you now,
 * The fair Ophelia? Nymph, in thy Orisons
 * Be all my sins remember'd. 
 *                              -Silvanus
 */
describe("/user", () => {
    let resolve_post;
    let post_promise;
    let setup_promise;
    beforeAll(() => {
        post_promise = new Promise((resolve, reject) => {
            resolve_post = resolve;
        });

        setup_promise = Promise.allSettled([
            del(400)('user/', { email: 'noem', password: 'nopw' }),
            del(200)('user/', { email: 'marco.rossi@example.com', password: 'PasswordSicura42' })
        ]);
    });

    test("POST (registrazione)", async () => {
        await setup_promise;

        let p1 = post(400)('user/', { email: 'noem', password: 'nopw' });
        let p2 = post(201)('user/', { email: 'marco.rossi@example.com', password: 'PasswordSicura42' });
        //let p2 = post(400)('user/', { email: 'marco.rossi@example.com', password: 'PasswordSicura42' });
        Promise.allSettled([ p1, p2 ]).then(resolve_post);
        await p1;
        await p2;
    });

    test("DELETE (deregistrazione)", async () => {
        await post_promise;
        await del(400)('user/', { email: 'noem', password: 'nopw' });
        await del(200)('user/', { email: 'marco.rossi@example.com', password: 'PasswordSicura42' });
    });

    afterAll(() => {
        server.close();
        mongoose.disconnect();
    });
});


