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

function init() {
    ws.on('open', () => {
        console.log("Table is online");
    });
    
    ws.on('message', data => {
        let tableEvent = JSON.parse(data);
        console.log(tableEvent);

        if (tableEvent.pin_name === 'BLUE_NET' ||
            tableEvent.pin_name === 'RED_NET') return;

        Match.findOne({'status': 'ACTIVE'}, (err, match) => {
            if (!match) {
                console.warn("No active matches, this goal won't be recorded.");
                return;
            }
    
            let player = tableEvent.pin_name === 'BLUE_GOAL_LINE' ? match.bluePlayer : match.redPlayer;
            let newGoal = new Goal({player, match});
    
            newGoal.save(err => {
                if (err) {
                    console.log("Error during goal saving");
                    return;
                }
    
                console.log("Goal recorded:");
                console.log("Player: " + (tableEvent.pin_name === "BLUE_GOAL_LINE" ? "Blue!" : "Red!"));
            });
        });
    });
}

let webSocketInstance = null;

wss.on('connection', ws => {
    console.log("Scoretable is connected");

    webSocketInstance = ws;

    ws.on('close', function close() {
        console.log("Scoretable disconnected");
        webSocketInstance = null;
    });
});


setInterval(() => {
    if (!webSocketInstance) return;

    Match.findOne({'status': 'ACTIVE'})
        .populate('redPlayer')
        .populate('bluePlayer')
        .exec((err, activeMatch) => {
        
        if (!activeMatch) return;

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
}, 500);

module.exports = {init};