require('dotenv').config(); //importante che avvenga il prima possibile
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

const express = require('express');
const routes = require('./routes/user');
const authentication = require('./routes/authentication');
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../openapi.json");

const app = express();
app.use(express.json());
const port = 3000;

mongoose.connect(
    process.env.MONGODB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        if (err) {
            return console.log("Error: ", err);
        }
        console.log("MongoDB Connection -- Ready state is:", mongoose.connection.readyState);
    }
);

const server = app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
    console.log(`Docs available at http://localhost:${port}/api-docs`);
});

app.use('/api/authenticate', authentication);

app.use('/', routes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
module.exports = { server };
