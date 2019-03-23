'use strict';
const cc = require('config-multipaas');
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const table = require('./table');

// Config file
const CONFIG = require('./config');

// Routes
const ROUTES = require('./routes');

// Database connection
mongoose.connect(CONFIG.database);

// Express server setup
let app = express();
app.use(morgan('dev'));
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({extended: false}));

// Set public and authenticated routes
app.use('/', ROUTES.app);
app.use('/api', ROUTES.api);

// Init table websocket
table.init();

let cfg = cc();
// Server init
let server = app.listen(cfg.get('PORT'), cfg.get('IP'), () => {
    let host = server.address().address,
        port = server.address().port;

    console.log('Server listening at http://%s:%s', host, port);
});