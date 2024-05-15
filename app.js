const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const users = {}; // Object to track users and their connections
const messageQueue = {}; // Object to store messages for offline users

io.on('connection', socket => {
    console.log('A user connected');

    socket.onAny((event, ...args) => {
        console.log("\x1b[36m%s\x1b[0m",`=> ${event} ${args}`);
    });

    socket.on('user_connected', username => {
        users[username] = socket.id;
        // Check for pending messages and send them if any
        if (messageQueue[username]) {
            messageQueue[username].forEach(message => {
                socket.emit('message', message);
            });
            delete messageQueue[username]; // Clear the message queue
        }
        console.log('User connected:', username, socket.id, users);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        // Remove user from users object
        const username = Object.keys(users).find(key => users[key] === socket.id);
        if (username) {
            delete users[username];
        }
    });

    socket.on('message', ({ to, message }) => {
        console.log('Message:', to, message);
        if (users[to]) {
            // Recipient is online, send message directly
            io.to(users[to]).emit('message', { from: socket.id, message });
        } else {
            // Recipient is offline, store message in queue
            if (!messageQueue[to]) {
                messageQueue[to] = [];
            }
            messageQueue[to].push({ from: 'sender', message });
        }
    });
});

server.listen(3000, () => {
    console.log('Server started on port 3000');
});
