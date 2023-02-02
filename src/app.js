require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const routes = require('./routes/user');
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../openapi.json");

const app = express();
const port = 3000;

mongoose.set('strictQuery', true);
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

app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
    console.log(`Docs available at http://localhost:${port}/api-docs`);
});

app.use('/', routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
module.exports = { app };