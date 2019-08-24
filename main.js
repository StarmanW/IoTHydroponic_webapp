const express = require('express'),
    config = require('./config.json'),
    fs = require('fs'),
    app = express();

// Function to create server
function createServer() {
    return app.listen(config.server.port, () => console.log(`Listening on port ${config.server.port}...`));
}

// Static files
app.use(express.static('public'));

// Init createServer() and socket.io
createServer();