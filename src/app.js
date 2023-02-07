require('dotenv').config(); //importante che avvenga il prima possibile

const express = require('express');
const cors = require('cors')

const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const authenticate = require('./routes/authenticate');
const user = require('./routes/user');
const ingredient = require('./routes/ingredient');
const dish = require('./routes/dish');
const category = require('./routes/category');
const menu = require('./routes/menu')
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../openapi.json");

const app = express();
app.use(express.json({limit: '5mb'}));
const port = 3000;

mongoose.connect(
    process.env.MONGODB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        /* istanbul ignore next */
        if (err) {
            return console.log("mongoose.connect failed with error: ", err);
        }
        console.log("MongoDB Connection -- Ready state is:", mongoose.connection.readyState);
    }
);

const server = app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}\n`+
    `Docs available at http://localhost:${port}/api/docs`);
});

app.use(cors()); //accept request from everywhere on all routes

//routes without protection
app.use('/api/', authenticate);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//protected routes with exceptions
app.use('/api/', user);
app.use('/api/', ingredient);
app.use('/api/', dish);
app.use('/api/', category);
app.use('/api/', menu);

module.exports = { server };