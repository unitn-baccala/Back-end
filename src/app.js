require('dotenv').config(); //importante che avvenga il prima possibile
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

const express = require('express');
const authentication = require('./routes/authentication');
const tokenChecker = require('./routes/tokenChecker');
const user = require('./routes/user');
const ingredient = require('./routes/ingredient');
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../openapi.json");

const app = express();
app.use(express.json());
const port = 3000;

let mongodb_connection_promise = mongoose.connect(
    process.env.MONGODB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        if (err) {
            return console.log("mongoose.connect failed with error: ", err);
        }
        console.log("MongoDB Connection -- Ready state is:", mongoose.connection.readyState);
    }
);

const server = app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
    console.log(`Docs available at http://localhost:${port}/api-docs`);
});

app.use('/api/authenticate', authentication);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(tokenChecker);

app.use('/api/', user);
app.use('/api/', ingredient);

module.exports = { server, mongodb_connection_promise };