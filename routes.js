'use strict';

const express = require('express');

const app = express();
const api = express.Router();

// Public routes
const authRoutes = require('./auth');

// API Routes 
const matchesRoutes = require('./routes/match');
const playersRoutes = require('./routes/players');

app.use('/', authRoutes);

api.use('/players', playersRoutes);
api.use('/matches', matchesRoutes);

module.exports = {app, api};