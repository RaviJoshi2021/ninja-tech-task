require('dotenv').config();
const express = require('express');
// const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// const jwt = require('jsonwebtoken');
const app = express();
const path = require('path');
const async = require("async");
require('./config/db-config')


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

function parallel(middlewares) {
    return function(request, response, next) {
        async.each(middlewares, function(mw, cb) {
            mw(request, response, cb);
        }, next);
    };
};

app.use(parallel([
    express.static(path.join(__dirname, 'uploads'))
]));
require('./routes/user-routes')(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));