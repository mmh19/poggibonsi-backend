'use strict';

const WebSocket = require('ws');

// Config file
const CONFIG = require('./config');

// Websocket init
const ws = new WebSocket(CONFIG.table);
const wss = new WebSocket.Server({ port: 8888 });

// Goal model
const Match = require('./models/Match');
const Goal = require('./models/Goal');

let BALL_DIAMETER = 0.032;

let sensors = {
    BLUE_GOAL_LINE: {
        ACTIVE: null,
        INACTIVE: null
    },
    RED_GOAL_LINE: {
        ACTIVE: null,
        INACTIVE: null
    }
};

function init() {
    ws.on('open', () => {
        console.log("Table is online");
    });
    
    ws.on('message', data => {
        let tableEvent = JSON.parse(data);
        console.log(tableEvent);

        if (tableEvent.pin_name === 'BLUE_NET' ||
            tableEvent.pin_name === 'RED_NET') return;

        sensors[tableEvent.pin_name][tableEvent.event_type] = tableEvent.time;

        let {ACTIVE, INACTIVE} = sensors[tableEvent.pin_name];

        if (ACTIVE && INACTIVE) {
            storeNewGoal(tableEvent);
        }
    });
}

function storeNewGoal(tableEvent) {
    // Check if there is an active match
    Match.findOne({'isActive': true}, (err, match) => {
        if (!match) {
            console.warn("No active matches, this goal won't be recorded.");
            return;
        }

        let {ACTIVE, INACTIVE} = sensors[tableEvent.pin_name];

        let duration = (INACTIVE - ACTIVE) / 1E6;
        let speed = (1 / duration) * BALL_DIAMETER;

        // Reset sensor status
        sensors[tableEvent.pin_name] = {ACTIVE: null, INACTIVE: null};

        let player = tableEvent.pin_name === 'BLUE_GOAL_LINE' ? match.bluePlayer : match.redPlayer;

        if (duration === 0) {
            console.log("Invalid goal detected");
            return;
        }

        let newGoal = new Goal({
            speed,
            duration,
            player,
            match,
        });

        newGoal.save(err => {
            if (err) {
                console.log("Error during goal saving");
                return;
            }

            console.log("Goal recorded:");
            console.log("Duration (s): " + duration);
            console.log("Speed (m/s): " + speed);
            console.log("Player: " + player.firstName);
        });
    });
}

let webSocketInstance = null;

wss.on('connection', ws => {
    console.log("Scoretable is connected");

    // ws.on('message', message => {
    //     console.log('received: %s', message);
    // });

    webSocketInstance = ws;

    ws.on('close', function close() {
        console.log("Scoretable disconnected");
        webSocketInstance = null;
    });
});


setInterval(() => {
    if (!webSocketInstance) return;

    Match.findOne({'isActive': true})
        .populate('redPlayer')
        .populate('bluePlayer')
        .exec((err, activeMatch) => {
        
        let {bluePlayer, redPlayer} = activeMatch;

        let promises = [
            new Promise((res, rej) => {
                Goal.find({
                    match: activeMatch,
                    player: bluePlayer
                }, (err, goals) => {
                    res(goals.length);
                });
            }),
            new Promise((res, rej) => {
                Goal.find({
                    match: activeMatch,
                    player: redPlayer
                }, (err, goals) => {
                    res(goals.length);
                });
            })
        ];

        Promise.all(promises).then((counts) => {
            let [blueScore, redScore] = counts;

            let resObj = {
                bluePlayer,
                redPlayer,
                blueScore,
                redScore
            };

            // console.log(resObj);
            webSocketInstance.send(JSON.stringify(resObj));
        });
    });
}, 2000);

module.exports = {init};