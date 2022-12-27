require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const routes = require('./routes/user');
const app = express();
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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

app.use('/', routes);