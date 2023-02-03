require('dotenv').config();
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);// avoid useless warning at every execution

const express = require('express');
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../openapi.json");

const app = express();
app.use(express.json());
const port = 3000;

mongoose.set('strictQuery', true);
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

app.use('/', require('./routes/user'));
app.use('/', require('./routes/ingredient'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = { server, mongodb_connection_promise };
